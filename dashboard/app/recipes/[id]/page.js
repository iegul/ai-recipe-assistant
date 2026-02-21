"use client";

import { useEffect, useState } from "react";
import { fetchRecipeById } from "@/lib/recipeService";
import Link from "next/link";
import { useParams } from "next/navigation";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function RecipeDetailPage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchRecipeById(id)
      .then((data) => {
        if (!data) alert("Tarif bulunamadı!");
        setRecipe(data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;

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

      <main className="text-black max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard icon="⏱️" label="Hazırlık Süresi" value={recipe.prepTime} />
          <InfoCard icon="📊" label="Zorluk" value={recipe.difficulty} />
          <InfoCard
            icon={recipe.inputType === "image" ? "📸" : "✍️"}
            label="Giriş Türü"
            value={recipe.inputType === "image" ? "Fotoğraf" : "Metin"}
          />
        </div>

        {recipe.inputType === "image" && recipe.rawIngredients && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">📸</span>
              <h2 className="text-lg font-semibold text-blue-900">
                Fotoğraftan Tespit Edilen Malzemeler
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {recipe.rawIngredients.map((ing, i) => (
                <span
                  key={i}
                  className="bg-white px-3 py-1 rounded-full text-sm font-medium text-blue-800 border border-blue-200"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">🥘 Malzemeler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recipe.ingredients?.map((ing, i) => (
              <div
                key={i}
                className="flex items-center p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                  ✓
                </div>
                <div>
                  <div className="font-medium">{ing.name}</div>
                  <div className="text-sm text-gray-600">{ing.quantity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">👨‍🍳 Yapılış</h2>
          <div className="space-y-4">
            {recipe.steps?.map((step, i) => (
              <div key={i} className="flex">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  {i + 1}
                </div>
                <p className="flex-1 pt-2 text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          Oluşturulma:{" "}
          {recipe.createdAt?.toDate?.()?.toLocaleString("tr-TR") ||
            "Bilinmiyor"}
        </p>
      </main>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
