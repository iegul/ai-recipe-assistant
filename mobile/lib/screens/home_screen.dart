import 'dart:io';
import 'dart:convert';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/api_service.dart';
import '../services/firestore_service.dart';
import '../models/recipe_model.dart';
import 'recipe_detail_screen.dart';
import 'saved_recipes_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _ingredientsController = TextEditingController();
  final ApiService _apiService = ApiService();
  final FirestoreService _firestoreService = FirestoreService();
  final ImagePicker _picker = ImagePicker();

  bool _isLoading = false;
  File? _selectedImage;

  // Metin malzemelerden tarif oluştur
  Future<void> _generateRecipeFromText() async {
    if (_ingredientsController.text.trim().isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Lütfen malzeme girin!')));
      return;
    }

    setState(() => _isLoading = true);

    try {
      final ingredients = _ingredientsController.text
          .split(',')
          .map((e) => e.trim())
          .where((e) => e.isNotEmpty)
          .toList();

      final recipe = await _apiService.generateRecipeFromText(ingredients);

      // Firestore'a kaydet
      await _firestoreService.saveRecipe(recipe);

      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => RecipeDetailScreen(recipe: recipe),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Hata: $e')));
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  // Fotoğraftan tarif oluştur (Web ve mobil uyumlu)
  Future<void> _generateRecipeFromImage(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );

      if (image == null) return;

      setState(() => _isLoading = true);

      // Web'de bytes, mobilde File kullan
      if (kIsWeb) {
        // Web için: XFile'dan bytes al, base64'e çevir
        final bytes = await image.readAsBytes();
        final base64Image = base64Encode(bytes);

        final recipe = await _apiService.generateRecipeFromImage(base64Image);

        // Firestore'a kaydet
        await _firestoreService.saveRecipe(recipe);

        if (mounted) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => RecipeDetailScreen(recipe: recipe),
            ),
          );
        }
      } else {
        // Mobil için: File objesi kullan
        _selectedImage = File(image.path);

        final recipe = await _apiService.generateRecipeFromImage(
          _selectedImage!,
        );

        // Firestore'a kaydet
        await _firestoreService.saveRecipe(recipe);

        if (mounted) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => RecipeDetailScreen(recipe: recipe),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Hata: $e')));
      }
    } finally {
      setState(() {
        _isLoading = false;
        _selectedImage = null;
      });
    }
  }

  // Fotoğraf kaynağı seçme dialog'u
  void _showImageSourceDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Fotoğraf Seç'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (!kIsWeb) // Mobilde kamera göster
              ListTile(
                leading: const Icon(Icons.camera_alt),
                title: const Text('Kamera'),
                onTap: () {
                  Navigator.pop(context);
                  _generateRecipeFromImage(ImageSource.camera);
                },
              ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Galeri'),
              onTap: () {
                Navigator.pop(context);
                _generateRecipeFromImage(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Recipe Assistant'),
        actions: [
          IconButton(
            icon: const Icon(Icons.bookmark),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const SavedRecipesScreen(),
                ),
              );
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Tarif oluşturuluyor...'),
                ],
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Icon(
                    Icons.restaurant_menu,
                    size: 80,
                    color: Colors.orange,
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'Yapay Zeka ile Tarif Oluştur',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 30),

                  // Malzeme girişi
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const Text(
                            'Malzemelerinizi Girin',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 10),
                          TextField(
                            controller: _ingredientsController,
                            maxLines: 4,
                            decoration: const InputDecoration(
                              hintText: 'Örn: domates, soğan, tavuk, pirinç',
                              border: OutlineInputBorder(),
                              helperText: 'Malzemeleri virgülle ayırın',
                            ),
                          ),
                          const SizedBox(height: 15),
                          ElevatedButton.icon(
                            onPressed: _generateRecipeFromText,
                            icon: const Icon(Icons.auto_awesome),
                            label: const Text('Tarif Oluştur'),
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.all(16),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),
                  const Row(
                    children: [
                      Expanded(child: Divider()),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 10),
                        child: Text('VEYA'),
                      ),
                      Expanded(child: Divider()),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Fotoğraf yükleme
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const Text(
                            'Fotoğraftan Tarif Oluştur',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 10),
                          const Text(
                            'Malzemelerinizin fotoğrafını çekin veya galeriden seçin',
                            style: TextStyle(color: Colors.grey),
                          ),
                          const SizedBox(height: 15),
                          OutlinedButton.icon(
                            onPressed: _showImageSourceDialog,
                            icon: const Icon(Icons.add_a_photo),
                            label: const Text('Fotoğraf Ekle'),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.all(16),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  @override
  void dispose() {
    _ingredientsController.dispose();
    super.dispose();
  }
}
