import { MongoClient } from 'mongodb';

// Your MongoDB connection string (you can find this in your MongoDB Atlas dashboard)
const uri = "mongodb+srv://aicreatorabhi1001:5IcyJU4yVGKqxaxa@cluster0.utwda.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let client = null;
let dbInstance = null;

export async function getDatabase() {
    if (dbInstance) {
        return dbInstance;
    }

    try {
        if (!client) {
            client = new MongoClient(uri);
        }
        
        if (!client.isConnected()) {
            await client.connect();
            console.log("Successfully connected to MongoDB");
        }
        
        dbInstance = client.db("loanManagement");
        return dbInstance;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

// Test the connection
getDatabase()
    .then(() => console.log("Database connection test successful"))
    .catch(console.error);
