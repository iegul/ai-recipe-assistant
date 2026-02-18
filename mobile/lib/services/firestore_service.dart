import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/recipe_model.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String collectionName = 'recipes';

  // Tarif kaydet
  Future<void> saveRecipe(Recipe recipe) async {
    try {
      await _firestore
          .collection(collectionName)
          .doc(recipe.id)
          .set(recipe.toFirestore());
    } catch (e) {
      throw Exception('Failed to save recipe: $e');
    }
  }

  // Tüm tarifleri getir (en yeniden eskiye)
  Stream<List<Recipe>> getRecipes() {
    return _firestore
        .collection(collectionName)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) {
          return snapshot.docs.map((doc) {
            return Recipe.fromFirestore(doc.data(), doc.id);
          }).toList();
        });
  }

  // Tek bir tarifi getir
  Future<Recipe?> getRecipe(String id) async {
    try {
      final doc = await _firestore.collection(collectionName).doc(id).get();
      if (doc.exists) {
        return Recipe.fromFirestore(doc.data()!, doc.id);
      }
      return null;
    } catch (e) {
      throw Exception('Failed to get recipe: $e');
    }
  }

  // Tarif sil
  Future<void> deleteRecipe(String id) async {
    try {
      await _firestore.collection(collectionName).doc(id).delete();
    } catch (e) {
      throw Exception('Failed to delete recipe: $e');
    }
  }

  // Tarifleri arama (tarif adına göre)
  Stream<List<Recipe>> searchRecipes(String query) {
    return _firestore
        .collection(collectionName)
        .orderBy('recipeName')
        .startAt([query])
        .endAt([query + '\uf8ff'])
        .snapshots()
        .map((snapshot) {
          return snapshot.docs.map((doc) {
            return Recipe.fromFirestore(doc.data(), doc.id);
          }).toList();
        });
  }
}
