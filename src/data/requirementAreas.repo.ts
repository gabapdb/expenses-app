import {
  collection,
  addDoc,
  getDocs,
  getFirestore,
} from "firebase/firestore";

export interface RequirementArea {
  id: string;
  name: string;
  createdAt: number;
}

const db = getFirestore();
const coll = collection(db, "requirementAreas");

/* 📥 Get all areas */
export async function getRequirementAreas(): Promise<RequirementArea[]> {
  const snap = await getDocs(coll);
  return snap.docs.map(doc => {
    const data = doc.data() as Omit<RequirementArea, "id">;
    return {
      id: doc.id, // ✅ Firestore doc ID is the source of truth
      ...data,
    };
  });
}

/* ➕ Add new area */
export async function addRequirementArea(name: string): Promise<void> {
  const newArea: Omit<RequirementArea, "id"> = {
    name: name.trim(),
    createdAt: Date.now(),
  };
  await addDoc(coll, newArea);
}
