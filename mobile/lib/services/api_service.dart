import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import '../models/recipe_model.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';

class ApiService {
  static String get baseUrl =>
      kIsWeb ? 'http://localhost:5000' : 'http://192.168.1.21:5000';

  Future<Recipe> generateRecipeFromText(List<String> ingredients) async {
    final response = await http.post(
      Uri.parse('$baseUrl/generate-recipe'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'ingredients': ingredients}),
    );

    _assertSuccess(response);
    final data = json.decode(response.body);
    return _parseRecipe(data, inputType: 'text', rawIngredients: ingredients);
  }

  Future<Recipe> generateRecipeFromImage(Object imageFile) async {
    late String base64Image;
    late String mimeType;

    if (kIsWeb) {
      base64Image = imageFile as String;
      mimeType = 'image/jpeg';
    } else {
      final file = imageFile as File;

      // Resmi sıkıştır
      final compressed = await FlutterImageCompress.compressWithFile(
        file.absolute.path,
        minWidth: 600,
        minHeight: 600,
        quality: 60,
        format: CompressFormat.jpeg,
      );

      if (compressed == null) throw Exception('Resim sıkıştırılamadı');

      base64Image = base64Encode(compressed);
      mimeType = 'image/jpeg';
    }

    final response = await http.post(
      Uri.parse('$baseUrl/generate-recipe-from-image'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'image': base64Image, 'mimeType': mimeType}),
    );

    _assertSuccess(response);
    final data = json.decode(response.body);
    return _parseRecipe(data, inputType: 'image');
  }

  void _assertSuccess(http.Response response) {
    if (response.statusCode != 200) {
      throw Exception('Server error: ${response.statusCode}');
    }
  }

  Recipe _parseRecipe(
    Map<String, dynamic> data, {
    required String inputType,
    List<String>? rawIngredients,
  }) {
    final recipeData = data['recipe'] as Map<String, dynamic>? ?? data;

    return Recipe(
      id:
          data['id'] as String? ??
          DateTime.now().millisecondsSinceEpoch.toString(),
      recipeName: recipeData['recipeName'] as String? ?? 'Tarif',
      ingredients: (recipeData['ingredients'] as List? ?? [])
          .map((i) => Ingredient.fromMap(i as Map<String, dynamic>))
          .toList(),
      steps: List<String>.from(recipeData['steps'] ?? []),
      prepTime: recipeData['prepTime'] as String? ?? 'Bilinmiyor',
      difficulty: recipeData['difficulty'] as String? ?? 'Medium',
      inputType: inputType,
      rawIngredients: rawIngredients,
      detectedIngredients: data['detectedIngredients'] != null
          ? List<String>.from(data['detectedIngredients'])
          : null,
      createdAt: DateTime.now(),
    );
  }
}
