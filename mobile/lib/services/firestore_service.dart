import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/recipe_model.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  static const _collection = 'recipes';

  Future<void> saveRecipe(Recipe recipe) async {
    await _firestore
        .collection(_collection)
        .doc(recipe.id)
        .set(recipe.toFirestore());
  }

  Stream<List<Recipe>> getRecipes() {
    return _firestore
        .collection(_collection)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map(
          (s) =>
              s.docs.map((d) => Recipe.fromFirestore(d.data(), d.id)).toList(),
        );
  }

  Future<Recipe?> getRecipe(String id) async {
    final doc = await _firestore.collection(_collection).doc(id).get();
    return doc.exists ? Recipe.fromFirestore(doc.data()!, doc.id) : null;
  }

  Future<void> deleteRecipe(String id) async {
    await _firestore.collection(_collection).doc(id).delete();
  }

  Stream<List<Recipe>> searchRecipes(String query) {
    return _firestore
        .collection(_collection)
        .orderBy('recipeName')
        .startAt([query])
        .endAt(['$query\uf8ff'])
        .snapshots()
        .map(
          (s) =>
              s.docs.map((d) => Recipe.fromFirestore(d.data(), d.id)).toList(),
        );
  }
}
