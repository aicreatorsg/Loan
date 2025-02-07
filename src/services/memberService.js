import { db } from '../config/firebase';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    getDoc,
    query,
    where,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';

const MEMBERS_COLLECTION = 'members';

export async function getAllMembers() {
    try {
        const membersRef = collection(db, MEMBERS_COLLECTION);
        const snapshot = await getDocs(membersRef);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...formatMemberData(doc.data())
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
            ...formatMemberData(memberDoc.data())
        };
    } catch (error) {
        console.error("Error fetching member:", error);
        throw error;
    }
}

export async function updateMember(memberId, updatedData) {
    try {
        // Validate the member exists
        const memberRef = doc(db, MEMBERS_COLLECTION, memberId);
        const memberDoc = await getDoc(memberRef);
        
        if (!memberDoc.exists()) {
            throw new Error('Member not found');
        }

        // Format and validate the data
        const validatedData = {
            name: String(updatedData.name || '').trim(),
            memberNumber: String(updatedData.memberNumber || '').trim(),
            loanAmount: Number(updatedData.loanAmount) || 0,
            interest: Number(updatedData.interest) || 0,
            installment: Number(updatedData.installment) || 0,
            balance: Number(updatedData.balance) || 0,
            updatedAt: serverTimestamp()
        };

        // Check if member number is being changed
        if (validatedData.memberNumber !== memberDoc.data().memberNumber) {
            // Check for duplicate member number
            const membersRef = collection(db, MEMBERS_COLLECTION);
            const q = query(membersRef, where("memberNumber", "==", validatedData.memberNumber));
            const snapshot = await getDocs(q);
            
            if (!snapshot.empty) {
                throw new Error(`Member number ${validatedData.memberNumber} already exists`);
            }
        }

        // Update the member
        await updateDoc(memberRef, validatedData);

        // Return the updated data
        return {
            id: memberId,
            ...validatedData,
            updatedAt: new Date().toISOString() // Convert server timestamp to ISO string for client
        };
    } catch (error) {
        console.error("Error updating member:", error);
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

// Helper function to format member data
function formatMemberData(data) {
    return {
        name: String(data.name || ''),
        memberNumber: String(data.memberNumber || ''),
        loanAmount: Number(data.loanAmount) || 0,
        interest: Number(data.interest) || 0,
        installment: Number(data.installment) || 0,
        balance: Number(data.balance) || 0,
        updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()).toISOString() : null
    };
}

export async function recordTransaction(memberId, amount, type) {
    try {
        const transactionData = {
            memberId,
            amount: Number(amount),
            type,
            timestamp: serverTimestamp()
        };

        const transactionsRef = collection(db, 'transactions');
        await addDoc(transactionsRef, transactionData);

        // Update member balance
        const memberRef = doc(db, MEMBERS_COLLECTION, memberId);
        const memberDoc = await getDoc(memberRef);
        
        if (!memberDoc.exists()) {
            throw new Error('Member not found');
        }

        const currentBalance = Number(memberDoc.data().balance) || 0;
        const newBalance = type === 'credit' ? currentBalance + amount : currentBalance - amount;

        await updateDoc(memberRef, {
            balance: newBalance,
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error recording transaction:', error);
        throw error;
    }
}

export async function getTransactionsByMemberId(memberId) {
    try {
        const transactionsRef = collection(db, 'transactions');
        const q = query(transactionsRef, where("memberId", "==", memberId));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp ? new Date(doc.data().timestamp.toDate()).toISOString() : null
        }));
    } catch (error) {
        console.error("Error fetching transactions:", error);
        throw error;
    }
}
