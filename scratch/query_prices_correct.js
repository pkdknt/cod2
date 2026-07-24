const { MongoClient } = require('mongodb');

const uri = "mongodb://marketing:WOCKyvkmc7BQthO6@ac-ysgqumk-shard-00-00.itkzohu.mongodb.net:27017,ac-ysgqumk-shard-00-01.itkzohu.mongodb.net:27017,ac-ysgqumk-shard-00-02.itkzohu.mongodb.net:27017/nhontam_db?replicaSet=atlas-1201o8-shard-0&authSource=admin&ssl=true";

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('nhontam_db');
    const collection = db.collection('vaccineprices');
    const items = await collection.find({}).toArray();
    console.log("COUNT IN DB:", items.length);
    console.log("ALL PRICES IN DB:");
    console.log(JSON.stringify(items, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
