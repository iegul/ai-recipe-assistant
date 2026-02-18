"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Link from "next/link";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function Dashboard() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    text: 0,
    image: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    topIngredients: [],
  });

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const q = query(collection(db, "recipes"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const recipesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRecipes(recipesData);
      calculateStats(recipesData);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (recipesData) => {
    const ingredientCount = {};

    recipesData.forEach((recipe) => {
      // Input type
      if (recipe.rawIngredients) {
        recipe.rawIngredients.forEach((ing) => {
          ingredientCount[ing] = (ingredientCount[ing] || 0) + 1;
        });
      }
    });

    const topIngredients = Object.entries(ingredientCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    setStats({
      total: recipesData.length,
      text: recipesData.filter((r) => r.inputType === "text").length,
      image: recipesData.filter((r) => r.inputType === "image").length,
      easy: recipesData.filter((r) => r.difficulty?.toLowerCase() === "easy")
        .length,
      medium: recipesData.filter(
        (r) => r.difficulty?.toLowerCase() === "medium",
      ).length,
      hard: recipesData.filter((r) => r.difficulty?.toLowerCase() === "hard")
        .length,
      topIngredients,
    });
  };

  const inputTypeData = {
    labels: ["Metin", "Fotoğraf"],
    datasets: [
      {
        data: [stats.text, stats.image],
        backgroundColor: ["#3B82F6", "#10B981"],
        borderWidth: 0,
      },
    ],
  };

  const difficultyData = {
    labels: ["Kolay", "Orta", "Zor"],
    datasets: [
      {
        label: "Tarif Sayısı",
        data: [stats.easy, stats.medium, stats.hard],
        backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
        borderWidth: 0,
      },
    ],
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
            <h1 className="text-3xl font-bold text-gray-900">
              🍳 AI Recipe Dashboard
            </h1>
            <Link
              href="/recipes"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Tüm Tarifleri Gör
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Toplam Tarif"
            value={stats.total}
            icon="📊"
            color="bg-blue-500"
          />
          <StatCard
            title="Metin Giriş"
            value={stats.text}
            icon="✍️"
            color="bg-blue-500"
          />
          <StatCard
            title="Fotoğraf Giriş"
            value={stats.image}
            icon="📸"
            color="bg-green-500"
          />
          <StatCard
            title="Son Tarif"
            value={recipes[0]?.recipeName?.slice(0, 20) || "Yok"}
            icon="🍽️"
            color="bg-orange-500"
            isText
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Input Type Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Giriş Türü Dağılımı</h2>
            <div className="h-64 flex items-center justify-center">
              <Pie
                data={inputTypeData}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </div>

          {/* Difficulty Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Zorluk Dağılımı</h2>
            <div className="h-64">
              <Bar
                data={difficultyData}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </div>
        </div>

        {/* Top Ingredients */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            En Çok Kullanılan Malzemeler
          </h2>
          <div className="space-y-3">
            {stats.topIngredients.map((ing, index) => (
              <div key={index} className="flex items-center">
                <span className="text-2xl mr-3">
                  {index === 0
                    ? "🥇"
                    : index === 1
                      ? "🥈"
                      : index === 2
                        ? "🥉"
                        : "🏅"}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium capitalize">{ing.name}</span>
                    <span className="text-gray-600">{ing.count} tarif</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${(ing.count / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Recipes */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Son Eklenen Tarifler</h2>
          <div className="space-y-3">
            {recipes.slice(0, 5).map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="block p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{recipe.recipeName}</h3>
                    <p className="text-sm text-gray-600">
                      {recipe.prepTime} • {recipe.difficulty} •{" "}
                      {recipe.inputType === "image" ? "📸" : "✍️"}
                    </p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color, isText }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className={`text-2xl font-bold mt-2 ${isText ? "text-base" : ""}`}>
            {value}
          </p>
        </div>
        <div className={`text-4xl ${color} bg-opacity-10 p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
