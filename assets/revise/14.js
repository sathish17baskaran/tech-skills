/* Quick-revision data for 14-rag-genai.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['14'] = {
  approach: [
    ['Clarify the use case', 'Knowledge Q&A, extraction, or behaviour? Data freshness, who may see what, latency and cost budget.'],
    ['Pick the lightest lever', 'Prompting first, RAG for missing knowledge, fine-tuning only for behaviour; smallest model that passes eval.'],
    ['Design ingestion', 'Parse, structure-aware chunking with overlap, embed, store with metadata and ACLs.'],
    ['Design retrieval', 'Query rewrite, hybrid search + metadata/security filters, retrieve wide, re-rank to the best 3-8.'],
    ['Ground the answer', 'Answer only from context with citations; "I don\'t know" below a score threshold; low temperature.'],
    ['Evaluate and operate', 'Golden set in CI (recall@K, groundedness), gateway with token quotas, tracing, caching, content safety.'],
    ['Close with responsibility', 'Human oversight for high-impact decisions, transparency, audit trail of model and prompt versions.']
  ],
  traps: [
    'Proposing fine-tuning to teach the model facts that change monthly.',
    'Skipping security trimming, so RAG leaks documents the user cannot open.',
    'Treating every bad answer as a model problem when it is a retrieval problem.',
    'Sending K=50 chunks straight to the LLM without re-ranking.',
    'Shipping prompt changes without an evaluation set.'
  ],
  sections: {
    llm: {
      say: 'An LLM predicts the next token from the tokens it has seen, so it knows only its training data plus your prompt. You pay per token, the context window caps prompt plus answer, and temperature controls randomness. It can hallucinate and has a knowledge cutoff, which RAG fixes by grounding answers in retrieved facts.',
      k: ['token', 'context window', 'temperature / top-p', 'hallucination', 'knowledge cutoff', 'system prompt', 'lost in the middle'],
      p: ['1 token is about 4 characters or 0.75 English words.', 'Low temperature (0-0.3) for factual RAG; higher for creative work.', 'Order: prompting, then RAG, then fine-tuning. RAG is for knowledge, fine-tuning for behaviour.', 'Reasoning models reject or ignore temperature/top-p.'],
      f: [['What is a hallucination and how does RAG reduce it?', 'A confident but false answer. RAG grounds the model in retrieved facts and tells it to answer only from that context, with citations.'],
          ['Is a bigger context window always better?', 'No. It costs more tokens and models can get "lost in the middle", missing facts buried in long contexts.'],
          ['Prompting vs RAG vs fine-tuning in one line each?', 'Prompting: better instructions, lowest cost. RAG: inject fresh or private documents at query time. Fine-tuning: retrain weights for style or specialised behaviour, highest effort.']],
      q: [{ q: 'Which temperature setting suits a factual RAG answer?', o: ['0.9', '1.5', '0 to 0.3', 'It does not matter'], a: 2, e: 'Low temperature keeps answers deterministic and close to the retrieved facts.' }]
    },
    prompting: {
      say: 'A prompt is a spec for the model. Set the role, rules and format in the system prompt, give a few examples, wrap untrusted data in delimiters and ask for schema-enforced structured output when code consumes the answer. Treat prompts as versioned, tested artefacts and log the prompt version with every response.',
      k: ['system vs user prompt', 'few-shot', 'structured output', 'JSON schema', 'delimiters', 'chain-of-thought', 'reasoning effort', 'prompt caching'],
      p: ['Delimiters reduce prompt injection but do not eliminate it; also limit what the model can do.', 'Reasoning models: no "think step by step"; give goal, constraints, success criteria.', 'Static content first, variable last, so providers cache the prefix.', 'Validate structured output in code anyway.'],
      f: [['How do you get reliable JSON out of an LLM?', 'Schema-enforced structured output (a JSON schema or GetResponseAsync<T> in .NET), low temperature and an example or two. Then validate in code and retry or fall back if it fails.'],
          ['How should you prompt a reasoning model differently?', 'Do not add "think step by step"; it already reasons. Keep the prompt short with the goal, constraints and success criteria, and tune reasoning effort instead of temperature.'],
          ['Why version prompts in Git?', 'Each change is reviewed and evaluated against a golden set, and logging the version with each response lets you trace a bad answer back to its prompt.']],
      q: [{ q: 'Why put the system prompt and examples first and the user data last?', o: ['Providers cache repeated prefixes, cutting cost and latency', 'Models read right to left', 'It disables prompt injection completely', 'It raises the temperature'], a: 0, e: 'An identical static prefix can be served from the provider\'s prompt cache.' }]
    },
    approach: {
      say: 'Start with prompting. Add RAG when the model lacks knowledge, and fine-tune only when it lacks a behaviour. Then pick the smallest model that passes your own evaluation. Fine-tuning does not reliably teach facts and cannot cite sources. These combine: RAG for facts, a small tuned model for format, and a router sending hard questions to a big model.',
      k: ['prompting', 'RAG', 'fine-tuning', 'LoRA / PEFT', 'distillation', 'small language model', 'quantisation', 'model routing'],
      p: ['Knowledge = RAG; behaviour = fine-tune; always start with prompting.', 'LoRA freezes the base model and trains small adapters: much cheaper.', '4-bit quantised model needs about a quarter of the 16-bit memory, with a small quality loss.', 'Choose models with your own eval set, not leaderboards.'],
      f: [['RAG or fine-tuning for internal policies that change monthly?', 'RAG. The facts change often and need citations and access control. Fine-tuning teaches behaviour, not frequently updated facts.'],
          ['When would you choose a small language model?', 'For narrow, high-volume tasks like classification, extraction or routing, when latency or cost matters, or when data must stay on-prem or on device. Prove it with your eval set.'],
          ['What is distillation?', 'A big teacher model generates answers and a small student model is trained to copy them on your task, keeping most of the quality at a fraction of the cost.']],
      q: [{ q: 'A bank wants answers in a strict house style and format, on facts that rarely change. Which lever fits best after prompting?', o: ['Removing the system prompt', 'A bigger context window', 'Higher temperature', 'Fine-tuning (e.g. LoRA)'], a: 3, e: 'Style and format are behaviour, which fine-tuning targets; RAG is for knowledge.' },
          { q: 'Which task suits a small or mini model?', o: ['Complex multi-step planning', 'High-volume classification and routing', 'Hard maths proofs', 'Long code generation across repos'], a: 1, e: 'Simple, high-volume, latency-sensitive tasks are where small models shine.' }]
    },
    rag: {
      say: 'RAG retrieves relevant pieces of your knowledge, augments the prompt with them, and lets the LLM generate a grounded answer with citations. There are two pipelines: offline ingestion that loads, parses, chunks, embeds and stores; and online retrieval that rewrites the query, retrieves, re-ranks and generates. Retrieval quality caps answer quality.',
      k: ['retrieve, augment, generate', 'ingestion pipeline', 'retrieval pipeline', 'grounding', 'citations', 'naive / advanced / modular RAG'],
      p: ['Most RAG problems are search problems.', 'Tell the model: answer only from context, otherwise say you don\'t know.', 'Benefits: private and fresh data without retraining, citations, access control.'],
      f: [['Name the steps of the RAG ingestion pipeline.', 'Load, clean and parse (OCR, tables, layout), chunk, embed, and store vectors with metadata and text.'],
          ['Naive vs advanced vs modular RAG?', 'Naive: chunk, embed, top-k, generate. Advanced adds query rewriting, hybrid search, re-ranking and better chunking. Modular or agentic adds routing, tools, multi-step retrieval and self-correction.']],
      q: [{ q: 'A RAG bot gives poor answers. Where should you usually look first?', o: ['The model\'s temperature', 'The UI colour scheme', 'Retrieval quality: did the right chunks come back?', 'The model\'s knowledge cutoff'], a: 2, e: 'Retrieval quality caps answer quality; most RAG problems are search problems.' }]
    },
    chunking: {
      say: 'Chunking splits documents into pieces precise enough to retrieve and complete enough to answer from. Start with 256 to 1024 tokens and 10 to 20 percent overlap, prefer structure-aware splits by headings, keep tables whole, and add context headers and metadata to every chunk. Tune sizes with evaluation, not guesswork.',
      k: ['fixed-size + overlap', 'recursive splitting', 'structure-aware chunking', 'semantic chunking', 'parent-child (small-to-big)', 'contextual chunk headers', 'metadata'],
      p: ['Start at 256-1024 tokens with 10-20% overlap.', 'Keep tables whole; repeat headers in row-wise text.', 'Store source, page, section, date and access level with each chunk.'],
      f: [['Why chunk documents at all?', 'Whole-document embeddings blur meaning, context windows and tokens are limited, and chunks become precise citations.'],
          ['What is parent-child (small-to-big) chunking?', 'Search over small chunks for precise matching, then send their larger parent section to the LLM for richer context.'],
          ['Why add overlap between chunks?', 'So an idea that spans a chunk boundary is not cut in half and lost.']],
      q: [{ q: 'Which chunking strategy starts a new chunk where sentence similarity drops?', o: ['Semantic chunking', 'Fixed-size', 'Sliding window', 'Recursive character'], a: 0, e: 'Semantic chunking uses embedding similarity between sentences to find topic shifts.' }]
    },
    embedding: {
      say: 'An embedding turns text or images into a vector of numbers so that similar meaning ends up close together. Dense embeddings capture meaning, sparse ones like BM25 capture keywords, and hybrid search uses both. Use the same model for documents and queries, benchmark on your own data, and protect the vector store like the source.',
      k: ['embedding', 'vector', 'dimensions', 'dense vs sparse', 'multimodal', 'Matryoshka', 'MTEB'],
      p: ['Same embedding model for documents and queries; changing it means re-embedding everything.', 'More dimensions = more nuance, but more storage and slower search.', 'Embeddings can leak information: secure the vector store.'],
      f: [['What happens if you switch embedding models?', 'Old and new vectors live in different spaces and cannot be compared, so you must re-embed every document.'],
          ['Dense vs sparse vectors?', 'Dense vectors (embeddings) capture meaning and synonyms. Sparse vectors (BM25, SPLADE) capture keyword weights and exact terms. Hybrid search combines them.']],
      q: [{ q: 'Documents were embedded with model A. Queries now use model B. What happens?', o: ['Search improves', 'Only latency changes', 'Nothing changes', 'Similarity scores become meaningless until documents are re-embedded'], a: 3, e: 'Different models produce incompatible vector spaces.' }]
    },
    vector: {
      say: 'Vector search finds the stored vectors nearest the query vector, usually by cosine similarity. Exact kNN compares against every vector, which is fine up to about 100k. At millions you need approximate nearest neighbour indexes like HNSW, trading a little recall for huge speed gains, and tuning parameters such as efSearch.',
      k: ['cosine similarity', 'dot product', 'Euclidean (L2)', 'exact kNN', 'ANN', 'HNSW', 'IVF / PQ', 'recall vs latency'],
      p: ['Dot product equals cosine on normalised vectors.', 'Exact kNN: 100% recall, O(n), fine to about 100k vectors.', 'HNSW: fast, high recall, memory-hungry; tune M, efConstruction, efSearch.', 'DiskANN for billion scale with low RAM.'],
      f: [['Exact kNN vs ANN?', 'Exact kNN compares every vector: perfect recall but O(n). ANN uses index structures like HNSW to trade a little recall for big speed gains, needed at millions of vectors.'],
          ['What is HNSW?', 'Hierarchical Navigable Small World: a multi-layer proximity graph index. Fast with high recall, but uses a lot of memory.']],
      q: [{ q: 'Which ANN index is the most popular, fast with high recall but memory-hungry?', o: ['IVF', 'HNSW', 'Product quantisation', 'B-tree'], a: 1, e: 'HNSW is a multi-layer graph with excellent speed and recall at a memory cost.' }]
    },
    topk: {
      say: 'Top-K returns the K most similar chunks, and K trades recall against noise. Too small misses facts; too large adds noise, cost and lost-in-the-middle problems. The sweet spot is to retrieve wide, around 20 to 50, re-rank, and send the best 3 to 8. Add a score threshold and use MMR to avoid near-duplicates.',
      k: ['top-K', 'recall', 'noise', 'similarity threshold', 'MMR', 'lost in the middle'],
      p: ['Retrieve 20-50, re-rank, send 3-8.', 'Below the threshold, say "I don\'t know".', 'MMR picks chunks that are relevant and different from each other.'],
      f: [['What goes wrong if K is too large?', 'Noise, cost and latency rise, and the key facts get lost in the middle of the context.'],
          ['What is MMR?', 'Maximal Marginal Relevance: selects chunks that are relevant to the query but different from each other, so you do not send five near-duplicates.']],
      q: [{ q: 'What is a sensible default retrieval shape?', o: ['Retrieve 3 and send 3', 'Retrieve 100 and send all 100', 'Retrieve 20-50, re-rank, send the best 3-8', 'Retrieve 1 only'], a: 2, e: 'Wide recall first, then precise re-ranking keeps the context small and relevant.' }]
    },
    metadata: {
      say: 'Metadata filtering narrows search with structured attributes such as date, product, region and access level, as well as semantic similarity. Pre-filtering filters first, so results always match; post-filtering can return fewer than K. Security trimming filters by the user\'s groups from the validated token, so RAG never leaks documents they cannot open.',
      k: ['pre-filtering', 'post-filtering', 'security trimming', 'ACL', 'self-query', 'filtered ANN'],
      p: ['Read user groups from the validated token on the server, never from the prompt.', 'Post-filtering with a strict filter can return few or zero results.', 'Filter operator support varies by store; test against the real store.'],
      f: [['How do you stop RAG leaking confidential documents?', 'Index ACLs as metadata and filter on the user\'s identity at query time (security trimming), plus PII redaction and output guardrails.'],
          ['Pre-filtering vs post-filtering?', 'Pre-filtering applies the filter before vector search, so every result matches. Post-filtering searches first and then filters, which can leave fewer than K results.']],
      q: [{ q: 'Where should a RAG system get the user\'s group memberships for security trimming?', o: ['From claims in the validated token on the server', 'From the user\'s prompt text', 'From the LLM\'s answer', 'From a browser cookie the user can edit'], a: 0, e: 'Only server-validated identity can be trusted; prompts can be manipulated.' }]
    },
    hybrid: {
      say: 'Hybrid search runs keyword search, BM25 for exact terms, and vector search for meaning together, then fuses the results, usually with Reciprocal Rank Fusion. Keywords win for codes, account numbers and acronyms; vectors win for paraphrases. Hybrid usually beats pure vector search on enterprise data, so it is a sensible default.',
      k: ['BM25', 'keyword search', 'vector search', 'Reciprocal Rank Fusion', 'k = 60', 'weighted fusion'],
      p: ['RRF score = sum of 1 / (k + rank), with k about 60.', 'RRF uses ranks, so no need to normalise BM25 vs cosine scores.', 'Exact codes like error IDs need keyword search.'],
      f: [['Why does RRF not need score normalisation?', 'It uses each document\'s rank in each list, not the raw scores, so BM25 and cosine scales never need to match.'],
          ['Hybrid search vs RAG Fusion?', 'Hybrid fuses two retrieval methods (keyword + vector) for one query. RAG Fusion fuses results from multiple query variants. Both typically use RRF.']],
      q: [{ q: 'A user searches for error code "AADSTS50076". Which retrieval method most reliably finds it?', o: ['Pure vector search', 'HyDE only', 'Random sampling', 'Keyword / BM25 search'], a: 3, e: 'Exact codes and identifiers are matched best by keyword search.' }]
    },
    ranking: {
      say: 'First-stage retrieval is fast but rough. A re-ranker re-scores the shortlist: a bi-encoder retriever embeds query and document separately and is fast; a cross-encoder reads them together and is much more accurate but too slow for millions, ideal for about 50. Then put the best chunks first because of lost in the middle.',
      k: ['bi-encoder', 'cross-encoder', 're-ranker', 'semantic ranker', 'business signals', 'lost in the middle'],
      p: ['Retrieve ~50 fast, cross-encoder re-rank, send ~5.', 'Boost recency and authority (official policy over an email).', 'LLMs focus on the start and end of context: best chunks first, or first and last.'],
      f: [['Why use a re-ranker if you already have vector search?', 'Bi-encoder retrieval is fast but approximate. A cross-encoder reads query and chunk together and scores relevance much more accurately on a small shortlist.'],
          ['Bi-encoder vs cross-encoder?', 'A bi-encoder embeds query and documents separately so document vectors are precomputed: fast, less precise. A cross-encoder scores each query-document pair jointly: accurate, slow.']],
      q: [{ q: 'Why is a cross-encoder not used for first-stage retrieval over a million chunks?', o: ['It cannot read text', 'It must score every query-document pair, which is too slow at that scale', 'It only works on images', 'It needs BM25 scores'], a: 1, e: 'Cross-encoders cannot precompute document vectors, so they suit only a small shortlist.' }]
    },
    query: {
      say: 'Query transformation rewrites messy questions into ones that retrieve better before you search. Techniques include rewriting, condensing follow-ups into standalone questions, multi-query expansion, HyDE, step-back prompting, decomposition, routing and filter extraction. Each is an extra LLM call adding latency and cost, so use them where evaluation shows a gain.',
      k: ['query rewriting', 'conversational condensing', 'multi-query expansion', 'HyDE', 'step-back prompting', 'decomposition', 'routing', 'self-query'],
      p: ['Each transformation = extra LLM call, latency and cost.', 'Use a small, cheap model for rewriting.', 'Routing: "my balance" goes to an API tool, not RAG.'],
      f: [['What is HyDE?', 'Hypothetical Document Embeddings: the LLM writes a fake answer, and you embed and search with that, because it sits closer to real answer chunks than the short question does.'],
          ['Why condense a follow-up question?', '"What about for business?" means nothing alone. Rewriting it with chat history into a standalone question makes retrieval work.']],
      q: [{ q: '"Compare the fees of card A and card B." Which technique helps most?', o: ['HyDE', 'Raising temperature', 'Decomposition into sub-questions', 'Removing metadata'], a: 2, e: 'Decomposition splits the multi-hop question into fees(A) and fees(B) and retrieves for each.' }]
    },
    fusion: {
      say: 'RAG Fusion generates several versions of the user\'s query, retrieves for each in parallel, then fuses the ranked lists with Reciprocal Rank Fusion so documents found by many queries rise. It boosts recall and robustness to vague questions, but costs N retrievals plus an extra LLM call, and generated queries can drift.',
      k: ['multi-query', 'Reciprocal Rank Fusion', 'recall', 'consensus ranking', 'query drift', 'parallel retrieval'],
      p: ['RAG Fusion = multi-query expansion + RRF.', 'Overkill for simple, precise questions.', 'Can combine with hybrid search.'],
      f: [['What are the pros and cons of RAG Fusion?', 'Pros: higher recall, robust to vague questions, consensus cuts flukes. Cons: N retrievals plus an extra LLM call, more latency and cost, and possible off-topic query drift.']],
      q: [{ q: 'What does RAG Fusion fuse?', o: ['Result lists from multiple generated query variants', 'Keyword and vector results for one query', 'Two different LLM answers', 'Chunks from two embedding models'], a: 0, e: 'It runs several phrasings and merges their ranked lists with RRF.' }]
    },
    eval: {
      say: 'Evaluate retrieval and generation separately. Retrieval metrics include recall at K, precision at K, hit rate, MRR and nDCG. Generation metrics include faithfulness or groundedness, answer relevance, correctness and citation accuracy, plus safety, latency and cost. Build a golden set of 50 to 200 real questions early and run evaluations in CI.',
      k: ['recall@K', 'precision@K', 'MRR', 'nDCG', 'faithfulness / groundedness', 'answer relevance', 'golden dataset', 'LLM-as-judge'],
      p: ['Golden set of 50-200 real questions, including "not in the docs" ones.', 'Calibrate LLM-as-judge against human labels.', 'Run evals in CI to catch regressions before release.'],
      f: [['Recall@K vs precision@K?', 'Recall@K: share of all relevant chunks found in the top K. Precision@K: share of the top K that are relevant.'],
          ['What is faithfulness or groundedness?', 'Whether every claim in the answer is supported by the retrieved context, i.e. the model did not make things up.'],
          ['Why include "not in the docs" questions in the golden set?', 'To check the system says "I don\'t know" instead of hallucinating when the answer is not there.']],
      q: [{ q: 'The answer contains a fee that appears nowhere in the retrieved chunks. Which metric catches this?', o: ['Recall@K', 'Hit rate', 'MRR', 'Faithfulness / groundedness'], a: 3, e: 'Groundedness checks claims against the context; retrieval metrics do not judge the answer.' },
          { q: 'Which metric rewards putting the first relevant result as high as possible?', o: ['Precision@K', 'MRR', 'Token cost', 'Answer relevance'], a: 1, e: 'Mean Reciprocal Rank measures how high the first relevant result ranks.' }]
    },
    advanced: {
      say: 'Advanced RAG patterns handle harder questions and data. GraphRAG builds a knowledge graph for global and multi-hop questions. Agentic RAG lets an agent decide when and where to retrieve. Corrective RAG grades retrieved documents and falls back if they are poor; Self-RAG reflects on its answer. Use text-to-SQL for numbers and a semantic cache for repeats.',
      k: ['GraphRAG', 'agentic RAG', 'Corrective RAG', 'Self-RAG', 'contextual retrieval', 'multimodal RAG', 'semantic cache', 'text-to-SQL'],
      p: ['GraphRAG suits "main themes across all complaints" questions.', 'For numbers and tables, query the database rather than embedding it.', 'Partition a semantic cache by user permissions.', 'Text-to-SQL runs with a read-only login and a row limit.'],
      f: [['When would you use GraphRAG?', 'For global questions across a whole corpus, like main themes in all complaints, and multi-hop reasoning over entities and relationships.'],
          ['What does Corrective RAG do?', 'It grades the retrieved documents; if they are poor, it rewrites the query or falls back to another source before generating.'],
          ['Why must a semantic cache be partitioned by permission?', 'Otherwise a cached answer built from restricted documents could be served to a user who is not allowed to see them.']],
      q: [{ q: 'Users ask "What was total card spend by region last quarter?" Which approach fits best?', o: ['Embedding the transactions table', 'HyDE', 'Text-to-SQL against the database', 'Larger chunk size'], a: 2, e: 'Numbers and aggregates come from querying structured data, not from similarity search.' }]
    },
    failures: {
      say: 'Map the symptom to the cause. "Not found" though it is in the docs means parsing, chunking or retrieval. Right docs but a wrong answer means ranking, noise or lost in the middle. Outdated answers mean a stale index. Hallucinations mean weak grounding. Restricted content means no security trimming. Slow and expensive means too many calls or big contexts.',
      k: ['parsing', 'retrieval failure', 'stale index', 'groundedness check', 'security trimming', 'tracing', 'caching'],
      p: ['Outdated answers: incremental re-indexing plus a "current version" filter.', 'Hallucination: answer-only-from-context, citations, low temperature, groundedness checks.', 'Trace prompt, retrieved chunks, tokens and latency to debug answers.'],
      f: [['The right documents are retrieved but the answer is wrong. What do you fix?', 'Ranking and context: add a re-ranker, reduce K, put the best chunks first, and clarify the prompt.'],
          ['The bot gives last year\'s policy. Likely cause and fix?', 'A stale index or no version filter. Re-index incrementally and filter on "current version" metadata.']],
      q: [{ q: 'A user sees content from an HR document they cannot open in SharePoint. What is missing?', o: ['Security trimming with ACL filters', 'Re-ranking', 'HyDE', 'Higher K'], a: 0, e: 'Without ACL metadata filters per user, retrieval ignores document permissions.' }]
    },
    llmops: {
      say: 'LLMOps is DevOps for LLM apps. Put one gateway in front of every model for auth, token quotas, routing and fallback, semantic caching and metering. Control token cost with output caps, prefix caching and right-sized models. Version prompt, model and parameters together, evaluate in CI, canary changes, trace with OpenTelemetry and enforce content safety and privacy.',
      k: ['LLM gateway', 'token rate limits', 'routing / fallback', 'semantic caching', 'prompt caching', 'model pinning', 'OpenTelemetry GenAI conventions', 'content safety'],
      p: ['Output tokens usually cost several times more than input: cap them.', 'Pin model versions; providers retire models on a schedule.', 'Keep raw prompts and answers out of traces by default.', '"Global" deployments may process data in any region; choose regional or data-zone for residency.'],
      f: [['What does an LLM gateway give you?', 'Central auth and keys, token quotas per app, routing and failover across deployments, semantic caching, cost metering for chargeback, and one place for content safety and logging.'],
          ['Name four ways to cut token cost.', 'Cap output tokens, keep a stable prefix for prompt caching, cache responses, send fewer re-ranked chunks, route easy tasks to a small model, and batch non-urgent jobs.'],
          ['How do you release a prompt or model change safely?', 'Open a PR, run the golden set in CI with quality gates (groundedness, relevance, safety, cost), canary to a small share of traffic, then monitor feedback, drift and cost.']],
      q: [{ q: 'Why limit tokens per minute per app rather than just requests?', o: ['Requests are free', 'Models ignore request limits', 'Tokens are easier to log', 'One app sending huge prompts could starve others even at low request counts'], a: 3, e: 'Token volume drives capacity and cost, so quotas must be in tokens.' },
          { q: 'Which is usually the most expensive part of an LLM call?', o: ['The HTTP headers', 'Output tokens', 'The system prompt when cached', 'TLS handshake'], a: 1, e: 'Output tokens usually cost several times more than input tokens, so cap answer length.' }]
    },
    responsible: {
      say: 'Responsible AI turns ethics into engineering controls. Microsoft\'s six principles are fairness, reliability and safety, privacy and security, inclusiveness, transparency and accountability. Australia\'s principles add contestability, and current national guidance has six essential practices. In practice: human oversight for high-impact decisions, model cards, red teaming, harm evaluations in CI and an audit trail.',
      k: ['fairness', 'transparency', 'accountability', 'contestability', 'human-in-the-loop', 'red teaming', 'model card', 'audit trail'],
      p: ['Australia\'s AI Ethics Principles (2019): 8 voluntary principles, including contestability.', 'Guidance for AI Adoption (Oct 2025): 6 essential practices, condensing the 10 guardrails.', 'All voluntary; privacy, consumer, anti-discrimination law and APRA standards still apply.', 'A named human owner answers for the system.'],
      f: [['Name Microsoft\'s six Responsible AI principles.', 'Fairness, reliability and safety, privacy and security, inclusiveness, transparency, and accountability.'],
          ['How do you make a GenAI system responsible in practice?', 'Impact assessment, red teaming, harm and fairness evaluations in CI, a transparency note, a human in the loop for high-impact decisions, a way to contest outcomes, and an audit trail of model and prompt versions.'],
          ['What does contestability mean?', 'People affected by an AI decision must be able to challenge it and get it reviewed.']],
      q: [{ q: 'Which principle does Australia\'s framework add beyond Microsoft\'s six?', o: ['Inclusiveness', 'Fairness', 'Contestability', 'Accountability'], a: 2, e: 'Australia\'s AI Ethics Principles include contestability: people can challenge an AI outcome.' }]
    }
  }
};
