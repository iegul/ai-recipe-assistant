import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import '../models/recipe_model.dart';

class ApiService {
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:5000';
    } else {
      return 'http://10.0.2.2:5000';
    }
  }

  // Metin malzemelerden tarif oluştur
  Future<Recipe> generateRecipeFromText(List<String> ingredients) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/generate-recipe'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'ingredients': ingredients}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        // Backend { success, id, recipe: {...} } döndürüyor
        final recipeData = data['recipe'] ?? data;

        return Recipe(
          id: data['id'] ?? DateTime.now().millisecondsSinceEpoch.toString(),
          recipeName: recipeData['recipeName'] ?? 'Tarif',
          ingredients: (recipeData['ingredients'] as List? ?? [])
              .map((i) => Ingredient.fromMap(i as Map<String, dynamic>))
              .toList(),
          steps: List<String>.from(recipeData['steps'] ?? []),
          prepTime: recipeData['prepTime'] ?? 'Bilinmiyor',
          difficulty: recipeData['difficulty'] ?? 'Medium',
          inputType: 'text',
          rawIngredients: ingredients,
          createdAt: DateTime.now(),
        );
      } else {
        throw Exception('Sunucu hatası: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }

  // Fotoğraftan tarif oluştur
  Future<Recipe> generateRecipeFromImage(dynamic imageFile) async {
    try {
      late String base64Image;

      if (kIsWeb) {
        base64Image = imageFile as String;
      } else {
        final bytes = await (imageFile as File).readAsBytes();
        base64Image = base64Encode(bytes);
      }

      final response = await http.post(
        Uri.parse('$baseUrl/generate-recipe-from-image'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'image': base64Image}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        // Backend { success, id, recipe: {...}, detectedIngredients: [...] } döndürüyor
        final recipeData = data['recipe'] ?? data;

        return Recipe(
          id: data['id'] ?? DateTime.now().millisecondsSinceEpoch.toString(),
          recipeName: recipeData['recipeName'] ?? 'Tarif',
          ingredients: (recipeData['ingredients'] as List? ?? [])
              .map((i) => Ingredient.fromMap(i as Map<String, dynamic>))
              .toList(),
          steps: List<String>.from(recipeData['steps'] ?? []),
          prepTime: recipeData['prepTime'] ?? 'Bilinmiyor',
          difficulty: recipeData['difficulty'] ?? 'Medium',
          inputType: 'image',
          detectedIngredients: data['detectedIngredients'] != null
              ? List<String>.from(data['detectedIngredients'])
              : null,
          createdAt: DateTime.now(),
        );
      } else {
        throw Exception('Sunucu hatası: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }
}
