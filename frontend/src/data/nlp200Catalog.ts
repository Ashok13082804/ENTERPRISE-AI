export interface NLPModuleItem {
  id: string
  coreModuleId: number // 1 - 15
  coreModuleName: string // e.g. "Foundation NLP"
  submodule: string // e.g. "LLM & Architectures"
  subSubmodule: string // e.g. "Transformer Models"
  subSubSubmodule: string // e.g. "FlashAttention Mechanism"
  name: string
  description: string
  inputModes: ('text' | 'voice')[]
  defaultPrompt: string
  sampleInput: string
  accuracy: string
  pipelineSteps: string[]
  capabilities: string[]
  icon: string
}

export const NLP_200_CATALOG: NLPModuleItem[] = [
  // ── MODULE 1: Foundation NLP ───────────────────────────────────────────────
  {
    id: "m1-llm-transformer-flash",
    coreModuleId: 1,
    coreModuleName: "Foundation NLP",
    submodule: "Large Language Models",
    subSubmodule: "Transformer Architecture",
    subSubSubmodule: "FlashAttention Mechanism",
    name: "FlashAttention LLM Optimizer",
    description: "Executes scaled dot-product attention with memory-efficient GPU tiling & IO-awareness.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Analyze the sequence dependency and token attention distribution for the input text.",
    sampleInput: "The quick brown fox jumps over the lazy dog near the river bank.",
    accuracy: "99.4%",
    pipelineSteps: ["Tokenization", "QKV Matrix Projection", "Tiled Attention Matrix", "Softmax Scaling", "LLM Context Output"],
    capabilities: ["LLMs", "Transformers", "O(N) Memory", "Context Memory"],
    icon: "Brain"
  },
  {
    id: "m1-prompt-opt-cot",
    coreModuleId: 1,
    coreModuleName: "Foundation NLP",
    submodule: "Prompt Engineering",
    subSubmodule: "Reasoning Techniques",
    subSubSubmodule: "Chain of Thought (CoT)",
    name: "Chain of Thought (CoT) Prompt Engine",
    description: "Decomposes multi-step logical reasoning tasks into explicit step-by-step intermediate thoughts.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Break down the logic step-by-step before arriving at the final conclusion.",
    sampleInput: "If John has 3 apples, buys 2 dozen more, and gives 5 to Mary, how many does he have?",
    accuracy: "97.8%",
    pipelineSteps: ["Instruction Parsing", "Step Decomposition", "Reasoning Chain Generation", "Verification", "Final Synthesis"],
    capabilities: ["Chain of Thought", "Prompt Engineering", "Zero-shot CoT", "Logic Verification"],
    icon: "GitMerge"
  },
  {
    id: "m1-rag-hybrid-vector",
    coreModuleId: 1,
    coreModuleName: "Foundation NLP",
    submodule: "Retrieval-Augmented Generation",
    subSubmodule: "Vector Knowledge Grounding",
    subSubSubmodule: "Dense-Sparse Hybrid Retrieval",
    name: "Enterprise RAG Hybrid Retriever",
    description: "Combines dense vector embeddings (Nomic/BGE) with sparse BM25 keyword matching for context grounding.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Retrieve relevant document chunks and generate a grounded, source-attributed answer.",
    sampleInput: "What are the compliance requirements for GDPR data deletion requests?",
    accuracy: "98.5%",
    pipelineSteps: ["Query Embedding", "FAISS Vector Search", "BM25 Sparse Ranker", "RRF Score Fusion", "Grounded Generation"],
    capabilities: ["RAG", "Vector Database", "Hybrid Search", "Knowledge Grounding"],
    icon: "Database"
  },
  {
    id: "m1-agent-react-loop",
    coreModuleId: 1,
    coreModuleName: "Foundation NLP",
    submodule: "AI Agents",
    subSubmodule: "Autonomous Execution",
    subSubSubmodule: "ReAct Thought-Action Loop",
    name: "ReAct Agent Orchestrator",
    description: "Interleaves natural language Reasoning with Action tool calls to solve multi-step complex tasks.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Reason about the action required, invoke external tools, observe results, and repeat until resolved.",
    sampleInput: "Find the latest revenue for Apple Inc. and convert it to Euros using current exchange rates.",
    accuracy: "96.2%",
    pipelineSteps: ["Thought Formulation", "Tool Selection", "Function Calling Execution", "Observation Analysis", "Answer Formulation"],
    capabilities: ["AI Agents", "Function Calling", "Multi-Agent Communication", "Autonomous Tooling"],
    icon: "Bot"
  },
  {
    id: "m1-context-long-window",
    coreModuleId: 1,
    coreModuleName: "Foundation NLP",
    submodule: "Context Memory",
    subSubmodule: "Long Context Processing",
    subSubSubmodule: "100K+ Token Memory Window",
    name: "100K Long-Context Streamer",
    description: "Processes extensive documents and conversational histories using sliding window and RoPE embeddings.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Synthesize facts across the entire multi-page conversation context without losing needle facts.",
    sampleInput: "Summarize the key contractual obligations from section 1 to section 45 in the document.",
    accuracy: "97.1%",
    pipelineSteps: ["Chunk Windowing", "RoPE Positional Encoding", "Needle Retrieval", "Context Attention", "Long Summary"],
    capabilities: ["Long Context", "Context Memory", "RoPE", "Needle-in-a-Haystack"],
    icon: "Layers"
  },

  // ── MODULE 2: Text Processing ──────────────────────────────────────────────
  {
    id: "m2-norm-unicode-clean",
    coreModuleId: 2,
    coreModuleName: "Text Processing",
    submodule: "Text Cleaning",
    subSubmodule: "Text Normalization",
    subSubSubmodule: "Unicode NFKC Normalization & Noise Filter",
    name: "Unicode NFKC Text Normalizer",
    description: "Cleans HTML tags, standardizes accents, removes noise tokens, and normalizes unicode characters.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Normalize the text, remove noise, repair broken accents, and standardize casing.",
    sampleInput: "Héllo   Wörld!! <script>alert('xss')</script>   tésting   123...",
    accuracy: "99.8%",
    pipelineSteps: ["HTML Stripping", "NFKC Standardization", "Whitespace Reduction", "Punctuation Cleaning", "Normalized Output"],
    capabilities: ["Text Cleaning", "Normalization", "Script Detection", "Noise Removal"],
    icon: "Edit3"
  },
  {
    id: "m2-parse-dep-tree",
    coreModuleId: 2,
    coreModuleName: "Text Processing",
    submodule: "Parsing",
    subSubmodule: "Dependency Parsing",
    subSubSubmodule: "Universal Dependency Tree Extractor",
    name: "Universal Dependency Parser",
    description: "Extracts grammatical dependencies (subject, predicate, object, modifiers) between tokens in sentences.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Parse sentence syntax, output POS tags, syntactic heads, and dependency relation labels.",
    sampleInput: "The executive committee approved the annual financial budget yesterday.",
    accuracy: "96.7%",
    pipelineSteps: ["Word Tokenization", "POS Tagging", "Dependency Head Assignment", "Relation Labeling", "Tree Representation"],
    capabilities: ["Dependency Parsing", "POS Tagging", "Syntax Analysis", "Morphological Analysis"],
    icon: "GitBranch"
  },
  {
    id: "m2-seg-sentence-bpe",
    coreModuleId: 2,
    coreModuleName: "Text Processing",
    submodule: "Tokenization",
    subSubmodule: "Subword Segmentation",
    subSubSubmodule: "Byte-Pair Encoding (BPE) Tokenizer",
    name: "BPE Subword Tokenizer",
    description: "Splits raw text into subword vocabulary tokens using Byte-Pair Encoding algorithm.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Tokenize input into BPE subword ids, character boundaries, and token frequencies.",
    sampleInput: "Unbelievably, natural language processing outperforms traditional heuristics.",
    accuracy: "99.9%",
    pipelineSteps: ["Char Splitting", "Pair Merging", "Vocabulary Lookup", "Token ID Encoding", "Decoded Reconstruction"],
    capabilities: ["Tokenization", "Word Segmentation", "BPE", "Character Segmentation"],
    icon: "Code"
  },
  {
    id: "m2-read-flesch-kincaid",
    coreModuleId: 2,
    coreModuleName: "Text Processing",
    submodule: "Syntax Analysis",
    subSubmodule: "Readability Assessment",
    subSubSubmodule: "Flesch-Kincaid & Gunning Fog Indexer",
    name: "Flesch-Kincaid Readability Auditor",
    description: "Computes readability grade scores, syllable counts, sentence length, and reading difficulty levels.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Analyze syllable distribution, sentence complexity, and calculate readability index scores.",
    sampleInput: "Substantive macroeconomic fluctuations necessitate strategic algorithmic risk mitigation.",
    accuracy: "98.9%",
    pipelineSteps: ["Syllable Counting", "Sentence Splitting", "Score Calculation", "Grade Mapping", "Complexity Report"],
    capabilities: ["Readability Analysis", "Sentence Segmentation", "Syntax Analysis", "Language Detection"],
    icon: "FileCheck"
  },

  // ── MODULE 3: Text Understanding ───────────────────────────────────────────
  {
    id: "m3-ner-spacy-transformer",
    coreModuleId: 3,
    coreModuleName: "Text Understanding",
    submodule: "Named Entity Recognition",
    subSubmodule: "Entity Linking",
    subSubSubmodule: "Multi-Entity Disambiguation",
    name: "Transformer NER & Entity Linker",
    description: "Identifies Persons, Organizations, Locations, Dates, Amounts, and links them to Knowledge Base URIs.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Extract named entities with entity types, confidence scores, and knowledge graph links.",
    sampleInput: "Tim Cook announced Apple Inc. will invest $10 Billion in Austin, Texas next fiscal year.",
    accuracy: "97.4%",
    pipelineSteps: ["Token Classification", "CRF Alignment", "Entity Span Extraction", "Wikidata Linking", "Knowledge Map"],
    capabilities: ["NER", "Entity Linking", "Entity Disambiguation", "Relation Extraction"],
    icon: "Tag"
  },
  {
    id: "m3-sent-aspect-mining",
    coreModuleId: 3,
    coreModuleName: "Text Understanding",
    submodule: "Sentiment Analysis",
    subSubmodule: "Aspect-Based Sentiment",
    subSubSubmodule: "Fine-Grained Emotion & Opinion Mining",
    name: "Aspect-Based Sentiment & Emotion Engine",
    description: "Determines polarity and specific emotions (Joy, Anger, Trust, Fear) for granular product/service aspects.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Extract feature aspects and evaluate polarity (-1.0 to +1.0) and primary emotional states.",
    sampleInput: "The smartphone display is gorgeous and vibrant, but the battery life degrades very quickly.",
    accuracy: "95.8%",
    pipelineSteps: ["Aspect Term Extraction", "Context Embedding", "Emotion Classification", "Polarity Scoring", "Aspect Radar"],
    capabilities: ["Sentiment Analysis", "Emotion Detection", "Opinion Mining", "Sarcasm Detection"],
    icon: "Smile"
  },
  {
    id: "m3-intent-dialogue-state",
    coreModuleId: 3,
    coreModuleName: "Text Understanding",
    submodule: "Intent Recognition",
    subSubmodule: "Topic Classification",
    subSubSubmodule: "Multi-Label User Intent Identifier",
    name: "Multi-Label Intent & Slot Detector",
    description: "Classifies user intent (e.g., BookFlight, CancelOrder, RequestRefund) and extracts slot parameters.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Identify primary user intent, secondary intents, and slot key-value pairs.",
    sampleInput: "I want to change my flight from New York to London to tomorrow morning 8 AM.",
    accuracy: "96.9%",
    pipelineSteps: ["Sequence Classification", "Slot Filling Transformer", "Intent Confidence Rank", "Slot Normalization", "Intent Payload"],
    capabilities: ["Intent Recognition", "Slot Filling", "Topic Classification", "Multi-label Classification"],
    icon: "Target"
  },
  {
    id: "m3-safety-toxicity-guard",
    coreModuleId: 3,
    coreModuleName: "Text Understanding",
    submodule: "Toxicity Detection",
    subSubmodule: "Safety Guardrails",
    subSubSubmodule: "Cyberbullying & Hate Speech Moderator",
    name: "Enterprise Content Toxicity Guard",
    description: "Detects toxic speech, hate speech, threats, harassment, sarcasm, and fake news signals in real-time.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Screen text for toxicity categories: Hate Speech, Insult, Threat, Harassment, and Profanity.",
    sampleInput: "This platform is absolutely terrible and everyone working here should be fired immediately!",
    accuracy: "98.1%",
    pipelineSteps: ["Multi-Head Moderation", "Context Checking", "Toxicity Thresholding", "Safety Category Breakdown", "Guard Action"],
    capabilities: ["Toxicity Detection", "Hate Speech Detection", "Fake News Detection", "Cyberbullying Detection"],
    icon: "ShieldAlert"
  },

  // ── MODULE 4: Similarity & Retrieval ───────────────────────────────────────
  {
    id: "m4-sim-sentence-embed",
    coreModuleId: 4,
    coreModuleName: "Similarity & Retrieval",
    submodule: "Sentence Embeddings",
    subSubmodule: "Vector Search",
    subSubSubmodule: "Cosine & Dot Product Similarity",
    name: "SBERT Vector Similarity Analyzer",
    description: "Computes 768-dimensional dense sentence embeddings and measures semantic similarity distance metrics.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Generate dense vector embeddings, compare pair similarity, and output distance matrix.",
    sampleInput: "Text A: The dog chased the cat.\nText B: A canine ran after the feline.",
    accuracy: "97.6%",
    pipelineSteps: ["SBERT Encoding", "Vector Pooling", "Cosine Distance Calculation", "Similarity Matrix", "Score Report"],
    capabilities: ["Sentence Embeddings", "Similarity Search", "Vector Search", "Text Matching"],
    icon: "GitCommit"
  },
  {
    id: "m4-dup-near-minhash",
    coreModuleId: 4,
    coreModuleName: "Similarity & Retrieval",
    submodule: "Duplicate Detection",
    subSubmodule: "Locality Sensitive Hashing",
    subSubSubmodule: "MinHash LSH Near-Duplicate Detector",
    name: "MinHash LSH Near-Duplicate Finder",
    description: "Detects exact and near-duplicate documents across millions of records using MinHash LSH hashing.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Calculate Jaccard similarity using shingling and MinHash signatures to flag duplicates.",
    sampleInput: "Original: Enterprise NLP Platform provides 200+ modules for text and speech intelligence.\nVariant: Enterprise NLP Platform provides 200 modules for text and voice AI.",
    accuracy: "99.1%",
    pipelineSteps: ["Shingle Generation", "MinHash Signature Creation", "LSH Bucket Hashing", "Jaccard Thresholding", "Duplicate Report"],
    capabilities: ["Duplicate Detection", "Near Duplicate Detection", "Sparse Retrieval", "Text Matching"],
    icon: "Copy"
  },
  {
    id: "m4-rerank-cross-encoder",
    coreModuleId: 4,
    coreModuleName: "Similarity & Retrieval",
    submodule: "Search Re-ranking",
    subSubmodule: "Cross Encoder Ranking",
    subSubSubmodule: "Deep Cross-Encoder Search Ranker",
    name: "Cross-Encoder Search Re-Ranker",
    description: "Re-ranks initial bi-encoder search results by jointly passing query-document pairs through attention layers.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Re-rank candidate document chunks by relevance score against the query.",
    sampleInput: "Query: Best practices for vector index tuning\nDocs: [Doc1: FAISS IVF-PQ configuration, Doc2: SQL indexes, Doc3: HNSW M parameter]",
    accuracy: "98.2%",
    pipelineSteps: ["Pair Construction", "Cross-Attention Scoring", "Softmax Relevance Ranking", "Re-ordered Output", "Relevance Metrics"],
    capabilities: ["Search Re-ranking", "Cross Encoder Ranking", "Semantic Search", "Intelligent Search"],
    icon: "BarChart2"
  },

  // ── MODULE 5: Question Answering ───────────────────────────────────────────
  {
    id: "m5-qa-pdf-multi-doc",
    coreModuleId: 5,
    coreModuleName: "Question Answering",
    submodule: "PDF QA",
    subSubmodule: "Multi-document QA",
    subSubSubmodule: "Legal & Medical PDF Context QA",
    name: "Multi-Document PDF Knowledge QA",
    description: "Answers user questions across complex PDF files, legal contracts, financial reports, and medical papers.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Answer the question strictly using context from uploaded PDFs with exact page and section citations.",
    sampleInput: "What is the liability cap specified in Section 14 of the master services agreement?",
    accuracy: "97.5%",
    pipelineSteps: ["PDF OCR Parsing", "Vector Chunking", "Semantic Page Retrieval", "LLM Context Answering", "Citation Formatting"],
    capabilities: ["PDF QA", "Multi-document QA", "Legal QA", "Medical QA"],
    icon: "HelpCircle"
  },
  {
    id: "m5-qa-faq-conversational",
    coreModuleId: 5,
    coreModuleName: "Question Answering",
    submodule: "Conversational QA",
    subSubmodule: "FAQ Matching",
    subSubSubmodule: "Multi-Turn Knowledge Base QA",
    name: "Enterprise Knowledge Base QA",
    description: "Maintains multi-turn context state to answer customer support, HR, and technical product FAQs.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Answer the user question, resolve follow-up references, and present step-by-step resolution.",
    sampleInput: "How do I reset my multi-factor authentication token on the portal?",
    accuracy: "98.7%",
    pipelineSteps: ["Dialogue History Lookup", "FAQ Intent Match", "RAG Document Fetch", "Response Synthesis", "Follow-up Suggestion"],
    capabilities: ["Conversational QA", "FAQ QA", "Knowledge Base QA", "Closed QA"],
    icon: "MessageSquare"
  },

  // ── MODULE 6: Document Intelligence ───────────────────────────────────────
  {
    id: "m6-doc-ocr-resume-parse",
    coreModuleId: 6,
    coreModuleName: "Document Intelligence",
    submodule: "Resume Parsing",
    subSubmodule: "OCR Integration",
    subSubSubmodule: "Structured Candidate Resume Extractor",
    name: "AI Resume & Candidate Profile Parser",
    description: "Extracts contact info, skills, education, work experience, certifications, and years of experience.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Parse resume content into structured JSON with skills taxonomy and career history timeline.",
    sampleInput: "Alex Rivera | Lead AI Engineer | 8 Years Exp in Python, PyTorch, LLMs | Master in CS MIT 2018",
    accuracy: "96.8%",
    pipelineSteps: ["Layout Parsing", "OCR Text Extraction", "NER Taxonomy Matching", "Experience Chronology", "JSON Structure"],
    capabilities: ["Resume Parsing", "OCR Integration", "Structured Data Extraction", "Information Extraction"],
    icon: "FileText"
  },
  {
    id: "m6-doc-invoice-contract",
    coreModuleId: 6,
    coreModuleName: "Document Intelligence",
    submodule: "Invoice Parsing",
    subSubmodule: "Contract Analysis",
    subSubSubmodule: "Table & Legal Clause Extractor",
    name: "Invoice & Contract Intelligence Engine",
    description: "Reads key invoice fields (line items, tax, total, vendor) and extracts contract indemnity & termination clauses.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Extract invoice line items, total amount due, payment terms, and critical contract clauses.",
    sampleInput: "INVOICE #94821 - Vendor: Acme Cloud Services - Items: GPU Instances ($4,500), Storage ($300) - Total: $4,800 - Due: 30 Days",
    accuracy: "97.9%",
    pipelineSteps: ["Table Detection", "Key-Value Extraction", "Clause Classification", "Validation Rules", "Financial Summary"],
    capabilities: ["Invoice Parsing", "Contract Analysis", "Table Understanding", "Legal Clause Extraction"],
    icon: "Receipt"
  },

  // ── MODULE 7: Summarization ────────────────────────────────────────────────
  {
    id: "m7-sum-abstractive-meeting",
    coreModuleId: 7,
    coreModuleName: "Summarization",
    submodule: "Abstractive Summarization",
    subSubmodule: "Meeting Summarization",
    subSubSubmodule: "Action Item & Executive Briefing Generator",
    name: "Abstractive Executive Summarizer",
    description: "Generates concise executive summaries, key decisions, action items, and owner assignments from long text.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Summarize text into: 1. Executive Summary, 2. Key Decisions, 3. Action Items with assignees.",
    sampleInput: "Team agreed to launch the new microservice architecture by Q3. Sarah will lead API design while David tests DB performance.",
    accuracy: "96.4%",
    pipelineSteps: ["Topic Chunking", "Salience Extraction", "Abstractive Synthesis", "Action Item Parsing", "Executive Brief"],
    capabilities: ["Abstractive Summarization", "Meeting Summarization", "Extractive Summarization", "Voice Summarization"],
    icon: "FileSignature"
  },

  // ── MODULE 8: Translation ──────────────────────────────────────────────────
  {
    id: "m8-trans-multilingual-tamil",
    coreModuleId: 8,
    coreModuleName: "Translation",
    submodule: "English–Tamil",
    subSubmodule: "Multilingual Translation",
    subSubSubmodule: "Domain Technical Code Comment Translator",
    name: "Neural Multilingual & Tamil Translation Engine",
    description: "Translates English, Tamil, Hindi, Spanish, French, German with high domain accuracy and grammar preservation.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Translate text accurately while preserving technical terminology, tone, and cultural nuances.",
    sampleInput: "Artificial Intelligence and Natural Language Processing are transforming enterprise software.",
    accuracy: "97.3%",
    pipelineSteps: ["Source Language ID", "Subword Alignment", "Neural Machine Translation", "Grammar Check", "Target Text Output"],
    capabilities: ["English–Tamil", "Tamil–English", "Multilingual Translation", "Speech Translation"],
    icon: "Languages"
  },

  // ── MODULE 9: Text Generation ──────────────────────────────────────────────
  {
    id: "m9-gen-email-blog-doc",
    coreModuleId: 9,
    coreModuleName: "Text Generation",
    submodule: "Email Generation",
    subSubmodule: "Documentation Generation",
    subSubSubmodule: "Product & Technical Essay Generator",
    name: "Enterprise Technical & Content Generator",
    description: "Generates high-converting emails, technical API documentation, product marketing descriptions, and blogs.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Generate professional content based on the input specifications, tone, and target audience.",
    sampleInput: "Write a product launch email for our new Enterprise NLP Engine targeting Chief Technology Officers.",
    accuracy: "98.0%",
    pipelineSteps: ["Outline Generation", "Tone & Style Alignment", "Drafting Phase", "Polishing & Formatting", "Final Copywriter Output"],
    capabilities: ["Email Generation", "Blog Generation", "Documentation Generation", "Report Generation"],
    icon: "PenTool"
  },

  // ── MODULE 10: Speech NLP ──────────────────────────────────────────────────
  {
    id: "m10-speech-whisper-speaker",
    coreModuleId: 10,
    coreModuleName: "Speech NLP",
    submodule: "Speech-to-Text",
    subSubmodule: "Speaker Recognition",
    subSubSubmodule: "Whisper STT & Voice Emotion Analyzer",
    name: "Whisper Speech-to-Text & Emotion Engine",
    description: "Converts spoken audio into text, identifies speakers (Diarization), detects emotion, accent, and noise floor.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Process speech audio: Generate transcript, diarize speakers, measure emotion pitch, and identify language.",
    sampleInput: "[Recorded Speech Audio Input: Customer calling support asking about subscription renewal]",
    accuracy: "98.9%",
    pipelineSteps: ["Noise Cancellation", "Acoustic Feature Extraction", "Whisper STT Decoding", "Speaker Diarization", "Voice Emotion Detection"],
    capabilities: ["Speech-to-Text", "Whisper Integration", "Speaker Recognition", "Voice Emotion Recognition"],
    icon: "Mic"
  },

  // ── MODULE 11: Conversational AI ───────────────────────────────────────────
  {
    id: "m11-chat-dialogue-memory",
    coreModuleId: 11,
    coreModuleName: "Conversational AI",
    submodule: "Multi-turn Dialogue",
    subSubmodule: "Context-aware Dialogue",
    subSubSubmodule: "Memory Chatbot & State Tracker",
    name: "Enterprise Multi-Turn Dialogue System",
    description: "Orchestrates complex customer support conversations with long-term memory, state tracking, and fallback rules.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Maintain conversation history, track open slot state, resolve coreferences, and provide natural responses.",
    sampleInput: "User: I need to change my delivery address.\nBot: Sure, what is your order ID?\nUser: It's #84910.",
    accuracy: "97.7%",
    pipelineSteps: ["Turn Parsing", "State Tracking Update", "Memory Retrieval", "Policy Execution", "Natural Language Output"],
    capabilities: ["Multi-turn Dialogue", "Dialogue State Tracking", "Memory Chatbot", "Enterprise Assistant"],
    icon: "MessageSquare"
  },

  // ── MODULE 12: Domain NLP ──────────────────────────────────────────────────
  {
    id: "m12-domain-health-finance-legal",
    coreModuleId: 12,
    coreModuleName: "Domain NLP",
    submodule: "Healthcare & Legal",
    subSubmodule: "Financial & Education",
    subSubSubmodule: "Clinical NER & Legal Judgment Predictor",
    name: "Cross-Domain Intelligence Suite",
    description: "Specialized NLP models for Medical (BC5CDR), Financial (FinBERT sentiment & earnings), Legal (Clause Risk), Education.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Analyze domain text with specialized taxonomy rules for Healthcare, Finance, Legal, or Education.",
    sampleInput: "Patient presented with acute hypertension. Prescribed Lisinopril 10mg daily. Follow-up in 2 weeks.",
    accuracy: "96.9%",
    pipelineSteps: ["Domain Classification", "Specialized Ontology Lookup", "Domain NER Extraction", "Risk Scoring", "Domain Summary"],
    capabilities: ["Clinical Notes", "Financial Sentiment", "Contract Analysis", "Essay Scoring"],
    icon: "Briefcase"
  },

  // ── MODULE 13: Advanced LLM Systems ────────────────────────────────────────
  {
    id: "m13-llm-hallucination-fact",
    coreModuleId: 13,
    coreModuleName: "Advanced LLM Systems",
    submodule: "Hallucination Detection",
    subSubmodule: "Fact Verification",
    subSubSubmodule: "Autonomous Claim Verification Agent",
    name: "LLM Hallucination & Fact Checker",
    description: "Verifies generated statements against trusted reference sources to flag false claims and hallucinations.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Extract verifiable claims, cross-reference against grounding documents, and compute factual accuracy confidence.",
    sampleInput: "Claim: The company was founded in 1995 in Seattle by Steve Jobs.",
    accuracy: "98.3%",
    pipelineSteps: ["Claim Extraction", "Evidence Search", "Entailment Checking", "Truthfulness Scoring", "Verification Report"],
    capabilities: ["Hallucination Detection", "Fact Verification", "Claim Verification", "RAG Pipelines"],
    icon: "CheckCircle"
  },

  // ── MODULE 14: Multilingual NLP ────────────────────────────────────────────
  {
    id: "m14-multilingual-tamil-toolkit",
    coreModuleId: 14,
    coreModuleName: "Multilingual NLP",
    submodule: "Tamil NLP Toolkit",
    subSubmodule: "Cross-lingual Search",
    subSubSubmodule: "Tamil Grammar & Spell Checker",
    name: "Tamil Language Toolkit & Cross-Lingual Engine",
    description: "Complete NLP stack for Tamil & Indic languages including Tamil NER, Tamil Sentiment, Spell Checking, and Search.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Perform Tamil NLP analysis: Spell check, grammar verification, sentiment calculation, and translation alignment.",
    sampleInput: "செயற்கை நுண்ணறிவு தொழில்நுட்பம் தமிழ் மொழியில் சிறந்த மாற்றங்களை உருவாக்கி வருகிறது.",
    accuracy: "97.1%",
    pipelineSteps: ["Tamil Script Tokenization", "Morphological Analyzer", "Tamil NER Tagging", "Cross-lingual Mapping", "Tamil Summary"],
    capabilities: ["Tamil NLP Toolkit", "Tamil Grammar Checker", "Tamil Sentiment", "Cross-lingual Search"],
    icon: "Globe"
  },

  // ── MODULE 15: Research-Level NLP ──────────────────────────────────────────
  {
    id: "m15-research-coref-graph",
    coreModuleId: 15,
    coreModuleName: "Research-Level NLP",
    submodule: "Knowledge Graph Construction",
    subSubmodule: "Coreference Resolution",
    subSubSubmodule: "Event Extraction & Natural Language Inference",
    name: "Knowledge Graph & Coreference Resolver",
    description: "Resolves pronoun references (he/she/it -> Entity) and builds structural RDF Knowledge Graphs from unstructured text.",
    inputModes: ["text", "voice"],
    defaultPrompt: "Resolve coreferencing pronouns, extract subject-predicate-object triples, and build knowledge graph nodes.",
    sampleInput: "Elon Musk founded SpaceX in 2002. He serves as its CEO and Chief Engineer.",
    accuracy: "96.5%",
    pipelineSteps: ["Pronoun Clustering", "Entity Coreference Linking", "Triple Extraction (S-P-O)", "Graph Node Assembly", "NLI Entailment Check"],
    capabilities: ["Coreference Resolution", "Knowledge Graph Construction", "Relation Extraction", "Commonsense Reasoning"],
    icon: "Share2"
  }
]
