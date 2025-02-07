import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const setupInitialAdmin = async (email, password) => {
    const auth = getAuth();
    
    try {
        // Create admin user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Store admin credentials in Firestore
        await setDoc(doc(db, 'admin', 'credentials'), {
            email: email,
            created: new Date().toISOString()
        });
        
        return {
            success: true,
            message: 'Admin account created successfully'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
};
