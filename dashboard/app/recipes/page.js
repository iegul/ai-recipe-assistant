"use client";

import { useEffect, useState } from "react";
import { fetchAllRecipes, deleteRecipeById } from "@/lib/recipeService";
import Link from "next/link";
import LoadingSpinner from "../components/LoadingSpinner";

const DIFFICULTY_STYLES = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchAllRecipes()
      .then(setRecipes)
      .finally(() => setLoading(false));
  }, []);

  const filtered = recipes.filter((r) => {
    const matchesSearch = r.recipeName
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesDifficulty =
      filterDifficulty === "all" ||
      r.difficulty?.toLowerCase() === filterDifficulty;
    const matchesType = filterType === "all" || r.inputType === filterType;
    return matchesSearch && matchesDifficulty && matchesType;
  });

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" tarifini silmek istediğinize emin misiniz?`))
      return;
    try {
      await deleteRecipeById(id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert("Hata: " + e.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Tüm Tarifler</h1>
          <Link
            href="/"
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <FilterField label="Ara">
            <input
              type="text"
              placeholder="Tarif adı..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </FilterField>
          <FilterField label="Zorluk">
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tümü</option>
              <option value="easy">Kolay</option>
              <option value="medium">Orta</option>
              <option value="hard">Zor</option>
            </select>
          </FilterField>
          <FilterField label="Giriş Türü">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tümü</option>
              <option value="text">Metin</option>
              <option value="image">Fotoğraf</option>
            </select>
          </FilterField>
        </div>

        <p className="text-gray-600 mb-4">{filtered.length} tarif bulundu</p>

        <div className="text-black grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold flex-1">
                  {recipe.recipeName}
                </h3>
                <span className="text-2xl ml-2">
                  {recipe.inputType === "image" ? "📸" : "✍️"}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <RecipeRow label="Süre">{recipe.prepTime}</RecipeRow>
                <RecipeRow label="Zorluk">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${DIFFICULTY_STYLES[recipe.difficulty?.toLowerCase()] ?? "bg-gray-100 text-gray-800"}`}
                  >
                    {recipe.difficulty}
                  </span>
                </RecipeRow>
                <RecipeRow label="Malzeme">
                  {recipe.ingredients?.length || 0} adet
                </RecipeRow>
                <RecipeRow label="Adım">
                  {recipe.steps?.length || 0} adet
                </RecipeRow>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/recipes/${recipe.id}`}
                  className="flex-1 bg-orange-500 text-white text-center py-2 rounded-lg hover:bg-orange-600 transition"
                >
                  Detay
                </Link>
                <button
                  onClick={() => handleDelete(recipe.id, recipe.recipeName)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Tarif bulunamadı</p>
          </div>
        )}
      </main>
    </div>
  );
}

function FilterField({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function RecipeRow({ label, children }) {
  return (
    <div className="flex items-center">
      <span className="font-medium w-20">{label}:</span>
      <span>{children}</span>
    </div>
  );
}
