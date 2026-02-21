import 'package:flutter/material.dart';
import '../models/recipe_model.dart';

class RecipeDetailScreen extends StatelessWidget {
  final Recipe recipe;

  const RecipeDetailScreen({super.key, required this.recipe});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tarif Detayı')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Tarif Adı
            Text(
              recipe.recipeName,
              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),

            // Zorluk ve Süre
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                Chip(
                  avatar: const Icon(Icons.timer, size: 18),
                  label: Text(recipe.prepTime),
                ),
                Chip(
                  avatar: const Icon(Icons.bar_chart, size: 18),
                  label: Text(recipe.difficulty),
                  backgroundColor: _getDifficultyColor(recipe.difficulty),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Tespit edilen malzemeler (eğer fotoğraftan oluşturulduysa)
            if (recipe.detectedIngredients != null &&
                recipe.detectedIngredients!.isNotEmpty) ...[
              Card(
                color: Colors.blue.shade50,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.camera_alt, color: Colors.blue),
                          SizedBox(width: 8),
                          Flexible(
                            child: Text(
                              'Fotoğraftan Tespit Edilen Malzemeler',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.blue,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        children: recipe.detectedIngredients!
                            .map(
                              (ingredient) => Chip(
                                label: Text(ingredient),
                                backgroundColor: Colors.white,
                              ),
                            )
                            .toList(),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Malzemeler
            const Text(
              'Malzemeler',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Card(
              child: ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: recipe.ingredients.length,
                separatorBuilder: (context, index) => const Divider(),
                itemBuilder: (context, index) {
                  final ingredient = recipe.ingredients[index];
                  return ListTile(
                    leading: const CircleAvatar(
                      child: Icon(Icons.check, size: 18),
                    ),
                    title: Text(ingredient.name),
                    trailing: Text(
                      ingredient.quantity,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.orange,
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 30),

            // Yapılış
            const Text(
              'Yapılış',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Card(
              child: ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: recipe.steps.length,
                separatorBuilder: (context, index) => const Divider(),
                itemBuilder: (context, index) {
                  return ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Colors.orange,
                      child: Text(
                        '${index + 1}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    title: Text(recipe.steps[index]),
                  );
                },
              ),
            ),
            const SizedBox(height: 30),

            // Oluşturma bilgisi
            Center(
              child: Text(
                'Oluşturulma: ${_formatDate(recipe.createdAt)}',
                style: const TextStyle(color: Colors.grey, fontSize: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getDifficultyColor(String difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return Colors.green.shade100;
      case 'medium':
        return Colors.orange.shade100;
      case 'hard':
        return Colors.red.shade100;
      default:
        return Colors.grey.shade100;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }
}
