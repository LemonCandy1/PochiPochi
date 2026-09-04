---
name: android-on-device-ai
description: Guide for developing on-device AI applications on Android using Google AI Edge, Gemini Nano via AICore, MediaPipe LLM Inference, ML Kit, and LiteRT. Covers hardware acceleration, streaming inference, lifecycle management, and clean architecture in Jetpack Compose and Kotlin.
---

# Android On-Device AI Development Guide

Use this skill when building or integrating on-device artificial intelligence and machine learning features into Android applications using Kotlin and Jetpack Compose.

## Core On-Device AI Pillars on Android

1. **Gemini Nano via Android AICore (System-level GenAI)**:
   - Zero APK download overhead for the foundation model; model weights are managed and updated by the Android system.
   - Requires compatible devices (e.g. Pixel 8+, Samsung Galaxy S24+).
   - Ideal for low-latency, privacy-critical text tasks: summarizing notes, smart replies, proofreading, and conversational agents.

2. **MediaPipe Tasks & LLM Inference (Google AI Edge)**:
   - Run open models locally (Gemma 2B, Gemma 7B, Falcon, Phi-2, StableLM) on device using CPU or GPU delegates.
   - Cross-device support across Android versions without requiring AICore.
   - Comprehensive multimodal tasks: Text Classification, Object Detection, Image Segmentation, Gesture Recognition, Audio Classification.

3. **Google ML Kit (Turnkey On-Device APIs)**:
   - Vision: Text Recognition (OCR), Face Detection, Barcode Scanning, Pose Detection, Digital Ink.
   - Natural Language: Language Identification, Translation (offline model download), Smart Reply, Entity Extraction.

4. **LiteRT (formerly TensorFlow Lite)**:
   - High-performance inference for custom models (.tflite / .bin).
   - Hardware delegates: NNAPI delegate, GPU delegate, and Hexagon/NPU acceleration.

---

## 1. Gemini Nano & AICore Integration

### Prerequisites & Dependencies
Add Google AI client or Google AI Edge Generative AI dependencies to `app/build.gradle.kts`:

```kotlin
dependencies {
    // Google AI Edge / Gemini Client SDK for Android
    implementation("com.google.ai.client.generativeai:generativeai:0.9.0")
    
    // Coroutines & Lifecycle for Jetpack Compose
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
}
```

### Clean Architecture & Repository Pattern

Isolate on-device AI operations within a clean repository interface that returns reactive Kotlin Flows for real-time token streaming.

```kotlin
interface AiAssistantRepository {
    fun generateResponse(prompt: String): Flow<String>
    suspend fun checkModelAvailability(): ModelStatus
}

enum class ModelStatus {
    AVAILABLE,
    DOWNLOADING,
    UNSUPPORTED_DEVICE,
    ERROR
}
```

### Implementation Example

```kotlin
class GeminiNanoRepositoryImpl(
    private val generativeModel: GenerativeModel
) : AiAssistantRepository {

    override fun generateResponse(prompt: String): Flow<String> = flow {
        val responseStream = generativeModel.generateContentStream(prompt)
        responseStream.collect { chunk ->
            chunk.text?.let { emit(it) }
        }
    }.flowOn(Dispatchers.IO)

    override suspend fun checkModelAvailability(): ModelStatus {
        return try {
            // Check hardware support & AICore initialization
            ModelStatus.AVAILABLE
        } catch (e: Exception) {
            ModelStatus.UNSUPPORTED_DEVICE
        }
    }
}
```

---

## 2. MediaPipe LLM Inference (Google AI Edge)

For running open-weights models like Gemma locally on device:

### Gradle Dependency
```kotlin
dependencies {
    implementation("com.google.mediapipe:tasks-genai:0.10.14")
}
```

### Initializing LlmInference with GPU Acceleration

```kotlin
import com.google.mediapipe.tasks.genai.llminference.LlmInference
import com.google.mediapipe.tasks.genai.llminference.LlmInference.LlmInferenceOptions

class MediaPipeLlmHelper(context: Context, modelPath: String) {

    private val options = LlmInferenceOptions.builder()
        .setModelPath(modelPath)
        .setMaxTokens(1024)
        .setTopK(40)
        .setTemperature(0.7f)
        .setResultListener { partialResult, done ->
            // Handle streaming token callbacks
        }
        .setErrorListener { error ->
            // Handle inference error
        }
        .build()

    private val llmInference = LlmInference.createFromOptions(context, options)

    fun generateAsync(prompt: String) {
        llmInference.generateResponseAsync(prompt)
    }

    fun close() {
        llmInference.close()
    }
}
```

---

## 3. Jetpack Compose UI Streaming Integration

Always consume streaming responses in Compose with lifecycle awareness and smooth auto-scroll:

```kotlin
@Composable
fun AiChatScreen(
    viewModel: AiChatViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val listState = rememberLazyListState()

    LaunchedEffect(uiState.messages.lastOrNull()?.text) {
        if (uiState.messages.isNotEmpty()) {
            listState.animateScrollToItem(uiState.messages.size - 1)
        }
    }

    Scaffold(
        bottomBar = {
            ChatInputBar(
                isGenerating = uiState.isGenerating,
                onSend = { prompt -> viewModel.sendMessage(prompt) }
            )
        }
    ) { padding ->
        LazyColumn(
            state = listState,
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            items(uiState.messages) { message ->
                ChatMessageBubble(message = message)
            }
        }
    }
}
```

---

## 4. Best Practices for Mobile AI Performance

1. **Thermal & Battery Throttling**:
   - Limit continuous background generation; execute intensive inference only when the app is foregrounded.
   - Release `LlmInference` or large model weights in `onCleared()` or `LifecycleEvent.ON_STOP` when memory is constrained.

2. **Offload Heavy Computation**:
   - Always run model loading and token generation on `Dispatchers.IO` or a dedicated background executor thread.
   - Never block the UI thread during model initialization or prompt compilation.

3. **Graceful Fallbacks**:
   - Test device capabilities at runtime: if on-device AICore / Gemini Nano is unsupported, gracefully offer cloud API generation (via Gemini Flash) or inform the user cleanly.

4. **Storage & Model Download Management**:
   - For MediaPipe or LiteRT models stored on external storage, verify file hash/integrity and check available disk space before initiating downloads.
