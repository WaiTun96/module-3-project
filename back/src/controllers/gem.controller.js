import { Gem, GemDetail } from "../schemas/schemas.js";

const getFilePath = (files, fieldName) => {
  if (files && files[fieldName] && files[fieldName][0]) {
    return `/uploads/${files[fieldName][0].filename}`;
  }
  return undefined;
};

export const identifyGem = async (req, res) => {
  try {
    const { ri, riMin, riMax, sg, sgMin, sgMax, opticalNature, birefringence } = req.body;
    const query = {};

    if (riMin !== undefined && riMin !== "" && riMax !== undefined && riMax !== "") {
      query.$and = query.$and || [];
      query.$and.push(
        { riMin: { $lte: Number(riMax) } },
        { riMax: { $gte: Number(riMin) } }
      );
    } else if (ri !== undefined && ri !== "") {
      query.riMin = { $lte: Number(ri) };
      query.riMax = { $gte: Number(ri) };
    }

    if (sgMin !== undefined && sgMin !== "" && sgMax !== undefined && sgMax !== "") {
      query.$and = query.$and || [];
      query.$and.push(
        { sgMin: { $lte: Number(sgMax) } },
        { sgMax: { $gte: Number(sgMin) } }
      );
    } else if (sg !== undefined && sg !== "") {
      query.sgMin = { $lte: Number(sg) };
      query.sgMax = { $gte: Number(sg) };
    }

    if (opticalNature && opticalNature.trim() !== "") {
      query.opticalNature = { $regex: new RegExp(opticalNature.trim(), "i") };
    }

    // Birefringence သည် Number မို့လို့ တိုက်ရိုက် Query လုပ်ပါမည်
    if (birefringence !== undefined && birefringence !== "" && Number(birefringence) > 0) {
      query.birefringence = Number(birefringence);
    }

    const matchedGems = await Gem.find(query).populate("details");
    res.status(200).json({ count: matchedGems.length, gems: matchedGems });
  } catch (error) {
    console.error("Identify Gem Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getGemDetails = async (req, res) => {
  try {
    const gem = await Gem.findById(req.params.gemId).populate("details");
    if (!gem) return res.status(404).json({ message: "Gem not found" });
    res.status(200).json({ success: true, data: gem });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllGems = async (req, res) => {
  try {
    const gems = await Gem.find().populate("details");
    res.status(200).json(gems);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createGem = async (req, res) => {
  try {
    const {
      name, riMin, riMax, sgMin, sgMax, opticalNature,
      birefringenceValue, 
      dichroismValue, dichroismPhoto: reqDichroismPhoto,
      spectrumValue, inclusionsValue, uvFluorescenceValue, chelseaFilterValue,
      spectrumPhoto: reqSpectrumPhoto,
      inclusionsPhoto: reqInclusionsPhoto,
      uvFluorescencePhoto: reqUvFluorescencePhoto,
      chelseaFilterPhoto: reqChelseaFilterPhoto
    } = req.body;

    if (!name || riMin === undefined || riMax === undefined || sgMin === undefined || sgMax === undefined) {
      return res.status(400).json({ message: "Please provide required fields (name, riMin, riMax, sgMin, sgMax)" });
    }

    // Photo Paths ယူခြင်း 
    const dichroismPhoto = getFilePath(req.files, "dichroismPhoto") || reqDichroismPhoto || "";
    const spectrumPhoto = getFilePath(req.files, "spectrumPhoto") || reqSpectrumPhoto || "";
    const inclusionsPhoto = getFilePath(req.files, "inclusionsPhoto") || reqInclusionsPhoto || "";
    const uvFluorescencePhoto = getFilePath(req.files, "uvFluorescencePhoto") || reqUvFluorescencePhoto || "";
    const chelseaFilterPhoto = getFilePath(req.files, "chelseaFilterPhoto") || reqChelseaFilterPhoto || "";

    const newGem = new Gem({
      name,
      riMin: Number(riMin),
      riMax: Number(riMax),
      sgMin: Number(sgMin),
      sgMax: Number(sgMax),
      opticalNature: opticalNature || "SR",
      birefringence: birefringenceValue ? Number(birefringenceValue) : 0
    });

    const newGemDetail = new GemDetail({
      gemId: newGem._id,
      dichroism: {
        value: dichroismValue || 'None',
        photo: dichroismPhoto
      },
      spectrum: { value: spectrumValue || 'N/A', photo: spectrumPhoto },
      inclusions: { value: inclusionsValue || 'N/A', photo: inclusionsPhoto },
      uvFluorescence: { value: uvFluorescenceValue || 'N/A', photo: uvFluorescencePhoto },
      chelseaFilter: { value: chelseaFilterValue || 'N/A', photo: chelseaFilterPhoto }
    });

    newGem.details = newGemDetail._id;

    await newGem.save();
    await newGemDetail.save();

    res.status(201).json({ message: "Gem created successfully", gem: newGem, details: newGemDetail });
  } catch (error) {
    console.error("Create Gem Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateGem = async (req, res) => {
  try {
    const { gemId } = req.params;
    const {
      name, riMin, riMax, sgMin, sgMax, opticalNature,
      birefringenceValue, 
      dichroismValue,
      spectrumValue, inclusionsValue, uvFluorescenceValue, chelseaFilterValue
    } = req.body;

    const gem = await Gem.findById(gemId);
    if (!gem) return res.status(404).json({ message: "Gem not found" });

    // File အသစ်တက်လာမှသာ File Path ယူမည်
    const newDichroismPhoto = getFilePath(req.files, "dichroismPhoto");
    const newSpectrumPhoto = getFilePath(req.files, "spectrumPhoto");
    const newInclusionsPhoto = getFilePath(req.files, "inclusionsPhoto");
    const newUvFluorescencePhoto = getFilePath(req.files, "uvFluorescencePhoto");
    const newChelseaFilterPhoto = getFilePath(req.files, "chelseaFilterPhoto");

    // 1. Gem Main Schema Update
    if (name) gem.name = name;
    if (riMin !== undefined && riMin !== "") gem.riMin = Number(riMin);
    if (riMax !== undefined && riMax !== "") gem.riMax = Number(riMax);
    if (sgMin !== undefined && sgMin !== "") gem.sgMin = Number(sgMin);
    if (sgMax !== undefined && sgMax !== "") gem.sgMax = Number(sgMax);
    if (opticalNature) gem.opticalNature = opticalNature;
    if (birefringenceValue !== undefined && birefringenceValue !== "") {
      gem.birefringence = Number(birefringenceValue);
    }

    await gem.save();

    // 2. GemDetail Document Update
    let detailDoc = await GemDetail.findOne({ gemId: gem._id });

    if (!detailDoc && gem.details) {
      detailDoc = await GemDetail.findById(gem.details);
    }

    if (detailDoc) {
      detailDoc.dichroism = {
        value: dichroismValue !== undefined ? dichroismValue : (detailDoc.dichroism?.value || 'None'),
        photo: newDichroismPhoto || detailDoc.dichroism?.photo || ""
      };

      detailDoc.spectrum = {
        value: spectrumValue !== undefined ? spectrumValue : (detailDoc.spectrum?.value || 'N/A'),
        photo: newSpectrumPhoto || detailDoc.spectrum?.photo || ""
      };

      detailDoc.inclusions = {
        value: inclusionsValue !== undefined ? inclusionsValue : (detailDoc.inclusions?.value || 'N/A'),
        photo: newInclusionsPhoto || detailDoc.inclusions?.photo || ""
      };

      detailDoc.uvFluorescence = {
        value: uvFluorescenceValue !== undefined ? uvFluorescenceValue : (detailDoc.uvFluorescence?.value || 'N/A'),
        photo: newUvFluorescencePhoto || detailDoc.uvFluorescence?.photo || ""
      };

      detailDoc.chelseaFilter = {
        value: chelseaFilterValue !== undefined ? chelseaFilterValue : (detailDoc.chelseaFilter?.value || 'N/A'),
        photo: newChelseaFilterPhoto || detailDoc.chelseaFilter?.photo || ""
      };

      await detailDoc.save();
    } else {
      const newGemDetail = new GemDetail({
        gemId: gem._id,
        dichroism: { 
          value: dichroismValue || 'None', 
          photo: newDichroismPhoto || "" 
        },
        spectrum: { value: spectrumValue || 'N/A', photo: newSpectrumPhoto || "" },
        inclusions: { value: inclusionsValue || 'N/A', photo: newInclusionsPhoto || "" },
        uvFluorescence: { value: uvFluorescenceValue || 'N/A', photo: newUvFluorescencePhoto || "" },
        chelseaFilter: { value: chelseaFilterValue || 'N/A', photo: newChelseaFilterPhoto || "" }
      });
      await newGemDetail.save();
      gem.details = newGemDetail._id;
      await gem.save();
    }

    const updatedGem = await Gem.findById(gemId).populate("details");
    res.status(200).json({ message: "Gem updated successfully", gem: updatedGem });
  } catch (error) {
    console.error("Update Gem Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteGem = async (req, res) => {
  try {
    const gem = await Gem.findById(req.params.gemId);
    if (!gem) return res.status(404).json({ message: "Gem not found" });
    // gemdetail ထဲက အချက်အလက်တွေကို အရင်ဖျက်ပြီးမှ main gem ထဲက အချက်အလက်တွေကို ဖျက်ခြင်း
    if (gem.details) await GemDetail.findByIdAndDelete(gem.details);
    await Gem.findByIdAndDelete(req.params.gemId);

    res.status(200).json({ message: "Gem deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};