import { db } from '../config/firebase';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    getDoc,
    query,
    where,
    updateDoc
} from 'firebase/firestore';

const MEMBERS_COLLECTION = 'members';

export async function getAllMembers() {
    try {
        const membersRef = collection(db, MEMBERS_COLLECTION);
        const snapshot = await getDocs(membersRef);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching members:", error);
        throw error;
    }
}

export async function getMemberById(memberId) {
    try {
        const memberRef = doc(db, MEMBERS_COLLECTION, memberId);
        const memberDoc = await getDoc(memberRef);
        
        if (!memberDoc.exists()) {
            return null;
        }
        
        return {
            id: memberDoc.id,
            ...memberDoc.data()
        };
    } catch (error) {
        console.error("Error fetching member:", error);
        throw error;
    }
}

export async function getMemberLoans(memberId) {
    try {
        const loansRef = collection(db, 'loans');
        const q = query(loansRef, where("memberId", "==", memberId));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching member loans:", error);
        throw error;
    }
}

export const updateMember = async (memberId, updatedData) => {
    try {
        const memberRef = doc(db, 'members', memberId);
        await updateDoc(memberRef, {
            ...updatedData,
            updatedAt: new Date()
        });
        return true;
    } catch (error) {
        console.error('Error updating member:', error);
        throw error;
    }
};

export const recordTransaction = async (memberId, amount, type) => {
    try {
        const memberRef = doc(db, 'members', memberId);
        const transactionRef = collection(db, 'transactions');
        
        // Get current member data
        const memberDoc = await getDoc(memberRef);
        const memberData = memberDoc.data();
        
        // Calculate new balance
        const newBalance = memberData.balance - amount;
        
        // Update member balance
        await updateDoc(memberRef, {
            balance: newBalance,
            updatedAt: new Date()
        });
        
        // Record transaction
        await addDoc(transactionRef, {
            memberId,
            memberName: memberData.name,
            memberNumber: memberData.memberNumber,
            amount,
            type,
            date: new Date(),
            previousBalance: memberData.balance,
            newBalance
        });
        
        return true;
    } catch (error) {
        console.error('Error recording transaction:', error);
        throw error;
    }
};

export const getTransactionsByMemberId = async (memberId) => {
    try {
        const transactionsRef = collection(db, 'transactions');
        const q = query(transactionsRef, where('memberId', '==', memberId));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting transactions:', error);
        throw error;
    }
};
