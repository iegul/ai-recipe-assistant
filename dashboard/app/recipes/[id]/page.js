"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function RecipeDetailPage() {
  const params = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchRecipe();
    }
  }, [params.id]);

  const fetchRecipe = async () => {
    try {
      const docRef = doc(db, "recipes", params.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setRecipe({ id: docSnap.id, ...docSnap.data() });
      } else {
        alert("Tarif bulunamadı!");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Tarif bulunamadı</p>
          <Link
            href="/recipes"
            className="text-orange-500 hover:underline mt-4 inline-block"
          >
            ← Tariflere Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/recipes"
            className="text-orange-500 hover:text-orange-600 font-medium inline-block mb-2"
          >
            ← Geri
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {recipe.recipeName}
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-sm text-gray-600">Hazırlık Süresi</div>
            <div className="font-semibold">{recipe.prepTime}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-sm text-gray-600">Zorluk</div>
            <div className="font-semibold">{recipe.difficulty}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl mb-2">
              {recipe.inputType === "image" ? "📸" : "✍️"}
            </div>
            <div className="text-sm text-gray-600">Giriş Türü</div>
            <div className="font-semibold">
              {recipe.inputType === "image" ? "Fotoğraf" : "Metin"}
            </div>
          </div>
        </div>

        {/* Detected Ingredients (if image) */}
        {recipe.inputType === "image" && recipe.rawIngredients && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">📸</span>
              <h2 className="text-lg font-semibold text-blue-900">
                Fotoğraftan Tespit Edilen Malzemeler
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {recipe.rawIngredients.map((ing, index) => (
                <span
                  key={index}
                  className="bg-white px-3 py-1 rounded-full text-sm font-medium text-blue-800 border border-blue-200"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="mr-2">🥘</span>
            Malzemeler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recipe.ingredients?.map((ing, index) => (
              <div
                key={index}
                className="flex items-center p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                  ✓
                </div>
                <div className="flex-1">
                  <div className="font-medium">{ing.name}</div>
                  <div className="text-sm text-gray-600">{ing.quantity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="mr-2">👨‍🍳</span>
            Yapılış
          </h2>
          <div className="space-y-4">
            {recipe.steps?.map((step, index) => (
              <div key={index} className="flex">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  {index + 1}
                </div>
                <div className="flex-1 pt-2">
                  <p className="text-gray-700">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Created At */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Oluşturulma:{" "}
          {recipe.createdAt?.toDate?.()?.toLocaleString("tr-TR") ||
            "Bilinmiyor"}
        </div>
      </main>
    </div>
  );
}
