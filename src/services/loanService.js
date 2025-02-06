import { db } from '../config/firebase';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    arrayUnion,
    Timestamp,
    getDoc
} from 'firebase/firestore';

const LOANS_COLLECTION = 'loans';

export async function createLoan(loanData) {
    try {
        const loansRef = collection(db, LOANS_COLLECTION);
        const docRef = await addDoc(loansRef, {
            ...loanData,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            payments: []
        });
        return { id: docRef.id };
    } catch (error) {
        console.error("Error creating loan:", error);
        throw error;
    }
}

export async function getAllLoans() {
    try {
        const loansRef = collection(db, LOANS_COLLECTION);
        const snapshot = await getDocs(loansRef);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching loans:", error);
        throw error;
    }
}

export async function updateLoanPayment(loanId, paymentData) {
    try {
        const loanRef = doc(db, LOANS_COLLECTION, loanId);
        
        await updateDoc(loanRef, {
            payments: arrayUnion({
                ...paymentData,
                createdAt: Timestamp.now()
            }),
            updatedAt: Timestamp.now()
        });
        
        return { success: true };
    } catch (error) {
        console.error("Error updating loan payment:", error);
        throw error;
    }
}

export async function getLoanById(loanId) {
    try {
        const loanRef = doc(db, LOANS_COLLECTION, loanId);
        const loanDoc = await getDoc(loanRef);
        
        if (!loanDoc.exists()) {
            return null;
        }
        
        return {
            id: loanDoc.id,
            ...loanDoc.data()
        };
    } catch (error) {
        console.error("Error fetching loan:", error);
        throw error;
    }
}
