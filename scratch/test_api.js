const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://marketing:njC5dcxAsz97e3bz@ac-ysgqumk-shard-00-00.itkzohu.mongodb.net:27017,ac-ysgqumk-shard-00-01.itkzohu.mongodb.net:27017,ac-ysgqumk-shard-00-02.itkzohu.mongodb.net:27017/nhontam_db?replicaSet=atlas-1201o8-shard-0&authSource=admin&ssl=true";

const VaccinePriceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    unit: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    checkupPrice: { type: Number, required: true, default: 0, min: 0 }
  },
  {
    timestamps: true,
  }
);

const VaccinePrice = mongoose.models.VaccinePrice || mongoose.model('VaccinePrice', VaccinePriceSchema);

async function main() {
  try {
    console.log("Connecting...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");

    console.log("Querying...");
    const items = await VaccinePrice.find({})
      .collation({ locale: 'vi', strength: 1 })
      .sort({ createdAt: -1 });

    console.log("Query successful! Count:", items.length);
    console.log("Sample:", items.slice(0, 3));
  } catch (err) {
    console.error("ERROR DETECTED:");
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
