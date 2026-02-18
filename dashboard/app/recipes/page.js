"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Link from "next/link";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterDifficulty, filterType, recipes]);

  const fetchRecipes = async () => {
    try {
      const q = query(collection(db, "recipes"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const recipesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecipes(recipesData);
      setFilteredRecipes(recipesData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = recipes;

    // Search
    if (searchTerm) {
      filtered = filtered.filter((recipe) =>
        recipe.recipeName?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Difficulty filter
    if (filterDifficulty !== "all") {
      filtered = filtered.filter(
        (recipe) => recipe.difficulty?.toLowerCase() === filterDifficulty,
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((recipe) => recipe.inputType === filterType);
    }

    setFilteredRecipes(filtered);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" tarifini silmek istediğinize emin misiniz?`))
      return;

    try {
      await deleteDoc(doc(db, "recipes", id));
      setRecipes(recipes.filter((r) => r.id !== id));
      alert("Tarif silindi!");
    } catch (error) {
      alert("Hata: " + error.message);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Tüm Tarifler</h1>
            <Link
              href="/"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ara
              </label>
              <input
                type="text"
                placeholder="Tarif adı..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zorluk
              </label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Tümü</option>
                <option value="easy">Kolay</option>
                <option value="medium">Orta</option>
                <option value="hard">Zor</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giriş Türü
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Tümü</option>
                <option value="text">Metin</option>
                <option value="image">Fotoğraf</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-gray-600 mb-4">
          {filteredRecipes.length} tarif bulundu
        </p>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold flex-1">
                    {recipe.recipeName}
                  </h3>
                  <span className="text-2xl ml-2">
                    {recipe.inputType === "image" ? "📸" : "✍️"}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <span className="font-medium w-20">Süre:</span>
                    <span>{recipe.prepTime}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-20">Zorluk:</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        recipe.difficulty?.toLowerCase() === "easy"
                          ? "bg-green-100 text-green-800"
                          : recipe.difficulty?.toLowerCase() === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {recipe.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-20">Malzeme:</span>
                    <span>{recipe.ingredients?.length || 0} adet</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-20">Adım:</span>
                    <span>{recipe.steps?.length || 0} adet</span>
                  </div>
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
            </div>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Tarif bulunamadı</p>
          </div>
        )}
      </main>
    </div>
  );
}
