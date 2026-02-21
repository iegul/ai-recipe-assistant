class Recipe {
  final String id;
  final String recipeName;
  final List<Ingredient> ingredients;
  final List<String> steps;
  final String prepTime;
  final String difficulty;
  final String inputType;
  final List<String>? rawIngredients;
  final List<String>? detectedIngredients;
  final DateTime createdAt;

  Recipe({
    required this.id,
    required this.recipeName,
    required this.ingredients,
    required this.steps,
    required this.prepTime,
    required this.difficulty,
    required this.inputType,
    this.rawIngredients,
    this.detectedIngredients,
    required this.createdAt,
  });

  factory Recipe.fromFirestore(Map<String, dynamic> data, String id) {
    return Recipe(
      id: id,
      recipeName: data['recipeName'] ?? 'Unknown Recipe',
      ingredients:
          (data['ingredients'] as List<dynamic>?)
              ?.map((i) => Ingredient.fromMap(i as Map<String, dynamic>))
              .toList() ??
          [],
      steps: List<String>.from(data['steps'] ?? []),
      prepTime: data['prepTime'] ?? 'Unknown',
      difficulty: data['difficulty'] ?? 'Medium',
      inputType: data['inputType'] ?? 'text',
      rawIngredients: data['rawIngredients'] != null
          ? List<String>.from(data['rawIngredients'])
          : null,
      detectedIngredients: data['detectedIngredients'] != null
          ? List<String>.from(data['detectedIngredients'])
          : null,
      createdAt: data['createdAt']?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() => {
    'recipeName': recipeName,
    'ingredients': ingredients.map((i) => i.toMap()).toList(),
    'steps': steps,
    'prepTime': prepTime,
    'difficulty': difficulty,
    'inputType': inputType,
    'rawIngredients': rawIngredients,
    'detectedIngredients': detectedIngredients,
    'createdAt': createdAt,
  };
}

class Ingredient {
  final String name;
  final String quantity;

  Ingredient({required this.name, required this.quantity});

  factory Ingredient.fromMap(Map<String, dynamic> map) =>
      Ingredient(name: map['name'] ?? '', quantity: map['quantity'] ?? '');

  Map<String, dynamic> toMap() => {'name': name, 'quantity': quantity};
}
