import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";

const recipesRef = () => collection(db, "recipes");

export const fetchAllRecipes = async () => {
  const snapshot = await getDocs(
    query(recipesRef(), orderBy("createdAt", "desc")),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const fetchRecipeById = async (id) => {
  const snap = await getDoc(doc(db, "recipes", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const deleteRecipeById = async (id) => {
  await deleteDoc(doc(db, "recipes", id));
};
