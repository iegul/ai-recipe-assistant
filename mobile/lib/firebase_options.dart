import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for macos - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyB9yYQPrgEhGlsxtdqufWXL_Tjwg80W2ek',
    appId: '1:881281213289:web:REPLACE_WITH_WEB_APP_ID',
    messagingSenderId: '881281213289',
    projectId: 'ancienda-recipe-ai',
    authDomain: 'ancienda-recipe-ai.firebaseapp.com',
    storageBucket: 'ancienda-recipe-ai.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyB9yYQPrgEhGlsxtdqufWXL_Tjwg80W2ek',
    appId: '1:881281213289:android:1c6b700fe2ad5983b893f8',
    messagingSenderId: '881281213289',
    projectId: 'ancienda-recipe-ai',
    storageBucket: 'ancienda-recipe-ai.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyB9yYQPrgEhGlsxtdqufWXL_Tjwg80W2ek',
    appId: '1:881281213289:ios:REPLACE_WITH_IOS_APP_ID',
    messagingSenderId: '881281213289',
    projectId: 'ancienda-recipe-ai',
    storageBucket: 'ancienda-recipe-ai.firebasestorage.app',
    iosBundleId: 'com.example.mobil',
  );
}
