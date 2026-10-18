/* Quick-revision data for 24-software-design-coding.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['24'] = {
  approach: [
    ['Start from the goal', 'Every principle and pattern serves cheap, safe change. Say what change you are protecting.'],
    ['Name the smell or problem', 'God class, growing switch, primitive obsession, hidden global, O(n^2) loop.'],
    ['Pick the principle or pattern', 'SOLID letter, Strategy, Decorator, Adapter, value object, HashSet: one line on why.'],
    ['Show it in .NET', 'DI registration, keyed services, Scrutor Decorate, records, FrozenSet, PriorityQueue.'],
    ['Say when not to use it', 'Over-applied DRY, pattern-itis, interfaces with one implementation, anaemic model that is fine for CRUD.'],
    ['For coding: clarify, brute force, optimise, test', 'State Big-O at each step and test edge cases out loud.']
  ],
  traps: [
    'Applying every pattern by reflex for a single if statement.',
    'Treating DRY as "no repeated text" and coupling unrelated code.',
    'Confusing dependency inversion (principle) with dependency injection (technique).',
    'Going silent in live coding instead of stating the brute force first.',
    'Recommending MediatR for a new project without mentioning the v13+ licence.'
  ],
  sections: {
    principles: {
      say: 'Design principles like DRY, KISS, YAGNI, separation of concerns, high cohesion and low coupling, composition over inheritance, Law of Demeter, tell don\'t ask, and fail fast all serve one goal: cheap, safe change. Each is good in moderation and harmful when pushed too far, so I use that goal to settle arguments.',
      k: ['DRY', 'KISS', 'YAGNI', 'separation of concerns', 'cohesion and coupling', 'composition over inheritance', 'Law of Demeter', 'fail fast'],
      p: ['DRY is about knowledge, not text: rule of three.', 'YAGNI never applies to security, observability or data integrity.', 'Decouple across boundaries, not inside one module.', 'Fail fast on requests; park bad records in batches.'],
      f: [
        ['When is duplicated code acceptable?', 'When the copies have different reasons to change. Merging them couples them; wait for the third copy before abstracting.'],
        ['What does "tell, don\'t ask" look like?', 'order.Pay(total) where the wallet checks funds, instead of pulling order.Customer.Wallet.Balance out and deciding for it.'],
        ['What does over-applied fail fast look like?', 'One bad record stopping a million-row batch. Fail fast on requests, but isolate and park bad rows in batches.']
      ],
      q: [{ q: 'Two products have identical fee code today but different owners and reasons to change. What should you do?', o: ['Merge it into a shared library now', 'Delete one product', 'Put it in a static global class', 'Keep the copies separate for now'], a: 3, e: 'DRY is about knowledge. Different reasons to change mean it is not true duplication; merging would couple the teams.' }]
    },
    solid: {
      say: 'SOLID keeps classes small, swappable and testable. Single responsibility: one reason to change. Open/closed: add a class, do not edit the switch. Liskov: subtypes keep the base promise. Interface segregation: small client-shaped interfaces. Dependency inversion: business code depends on abstractions. DI is just one way to apply the D.',
      k: ['single responsibility', 'open/closed', 'Liskov substitution', 'interface segregation', 'dependency inversion', 'constructor injection', 'IEnumerable<T> injection', 'seams'],
      p: ['LSP violations show as type checks and NotSupportedException overrides.', 'Add interfaces at seams (I/O, external systems), not for every class.', 'An interface with one implementation and no fake is ceremony.', 'Open/closed in .NET: register many IFeeRule and inject IEnumerable.'],
      f: [
        ['Dependency inversion vs dependency injection?', 'Inversion is the principle: high-level code depends on abstractions. Injection is the technique: dependencies are passed in. The container automates DI.'],
        ['How does a ReadOnlyAccount break Liskov?', 'Overriding Deposit to throw NotSupportedException breaks the base promise. Split the abstraction into reader and depositor interfaces.'],
        ['How do you apply open/closed to fee rules in ASP.NET Core?', 'Define IFeeRule, register one class per rail, and inject IEnumerable<IFeeRule> or keyed services. A new rail is a new class, no edits.']
      ],
      q: [{ q: 'A subclass overrides a method to throw NotSupportedException. Which principle is broken?', o: ['Single responsibility', 'Open/closed', 'Liskov substitution', 'Interface segregation'], a: 2, e: 'The subtype cannot be used wherever the base type is expected, so substitution fails.' }]
    },
    creational: {
      say: 'Creational patterns control how objects are created so callers do not depend on concrete classes: factory method, abstract factory, builder, singleton and prototype. In ASP.NET Core the DI container is the main factory. I prefer a DI singleton to a static singleton, builders for readable setup and test data, and records with "with" for prototypes.',
      k: ['factory method', 'abstract factory', 'builder', 'singleton', 'prototype', 'factory delegate', 'ActivatorUtilities', 'object pooling'],
      p: ['Write your own factory only when the choice depends on runtime data.', 'A singleton must be thread-safe and never hold a scoped service.', 'IHttpClientFactory and ILoggerFactory are factory methods.', 'Record "with" expressions are a safe prototype copy.'],
      f: [
        ['Why is a DI singleton better than a static singleton?', 'It is visible in the constructor, replaceable with a fake in tests, its lifetime is one line of config, and the container handles thread-safe creation and disposal.'],
        ['Where do you use the builder pattern every day in .NET?', 'WebApplication.CreateBuilder, StringBuilder, UriBuilder and DbContextOptionsBuilder; also test data builders.'],
        ['How do you pick an implementation from config at startup?', 'Register a factory delegate: AddSingleton<IFxRateClient>(sp => opts.UseStub ? new StubFxClient() : new LiveFxClient(...)).']
      ],
      q: [{ q: 'Which .NET feature is the simplest way to implement the prototype pattern?', o: ['A static readonly instance', 'A record with a "with" expression', 'DbProviderFactory', 'ActivatorUtilities'], a: 1, e: 'payment with { Attempt = payment.Attempt + 1 } copies the object and changes one field.' }]
    },
    structural: {
      say: 'Structural patterns wrap or combine objects. Adapter changes an interface to the one you need, like wrapping a vendor SDK. Decorator keeps the interface and adds behaviour such as caching or logging. Proxy keeps the interface and controls access. Facade gives one simple entry point over many subsystems, and Composite treats a tree like one item.',
      k: ['adapter', 'decorator', 'proxy', 'facade', 'composite', 'DelegatingHandler', 'Scrutor Decorate', 'anti-corruption layer'],
      p: ['Decorator adds behaviour; proxy controls access. Same shape.', 'Wrap every vendor SDK in an adapter.', 'Decorator order matters: decide cache vs retry on purpose.', 'DispatchProxy is not AOT-friendly.'],
      f: [
        ['Decorator, proxy or adapter?', 'Adapter changes the interface. Decorator keeps it and adds behaviour like caching. Proxy keeps it and controls access, like lazy loading or permission checks.'],
        ['Give .NET examples of decorators.', 'DelegatingHandler around HttpClient, GZipStream over a Stream, and IChatClient middleware built with ChatClientBuilder.'],
        ['Why put an adapter around a vendor SDK?', 'Swapping vendors then touches one class, and vendor types do not leak into your domain.']
      ],
      q: [{ q: 'You add caching around IFxRateService without changing the class or its interface. Which pattern?', o: ['Decorator', 'Adapter', 'Facade', 'Composite'], a: 0, e: 'A decorator implements the same interface and adds behaviour around the real service.' }]
    },
    behavioural: {
      say: 'Behavioural patterns describe how objects share work: Strategy swaps an algorithm behind one interface, Observer reacts to events, Command turns a request into an object, Chain of responsibility passes a request along a pipeline, and State makes transitions explicit. ASP.NET Core middleware is a chain, and keyed services make Strategy easy.',
      k: ['strategy', 'observer', 'mediator', 'command', 'chain of responsibility', 'template method', 'state machine', 'specification'],
      p: ['Strategy + DI = open/closed in practice.', 'You may not need a mediator; inject handlers directly.', 'MediatR v13+ needs a commercial licence unless you qualify for the Community tier.', 'Make illegal state transitions impossible, not just checked.'],
      f: [
        ['Should a new .NET project use MediatR?', 'Check the licence: v13+ is dual-licensed and needs a paid licence unless you qualify for the free Community tier. Alternatives: source-generated Mediator (MIT), Wolverine, or plain handlers.'],
        ['Where is chain of responsibility in ASP.NET Core?', 'The middleware pipeline and the DelegatingHandler chain: each link handles the request or passes it on.'],
        ['How do you model a payment lifecycle?', 'As a state machine (e.g. the Stateless library) with explicit transitions, so settling an unauthorised payment is impossible.']
      ],
      q: [{ q: 'You pick a payment rail implementation by name at run time. Which pattern and .NET feature?', o: ['Observer with C# events', 'Template method with BackgroundService', 'Composite with configuration sections', 'Strategy with keyed services'], a: 3, e: 'Each rail is a strategy behind IPaymentRail; keyed services resolve the right one by key.' }]
    },
    smells: {
      say: 'Code smells are warning signs that change will be hard: god classes, anaemic domain models, primitive obsession, shotgun surgery, feature envy, long parameter lists, magic numbers, leaky abstractions and pattern-itis. I fix them with small behaviour-preserving refactorings, keeping tests green after each step.',
      k: ['god class', 'anaemic domain model', 'primitive obsession', 'shotgun surgery', 'feature envy', 'parameter object', 'value object', 'pattern-itis'],
      p: ['Value objects make invalid data unrepresentable.', 'Over-engineering is a smell too.', 'Anaemic model is fine for CRUD and DTOs.', 'Refactor in tiny steps with tests green.'],
      f: [
        ['Is an anaemic domain model always bad?', 'No. For CRUD, reporting or thin data APIs it is simpler. It is a problem when real rules and invariants are scattered and anyone can set fields directly.'],
        ['How do you fix primitive obsession?', 'Introduce value objects like Bsb and Money that validate on creation, e.g. a readonly record struct.'],
        ['What is shotgun surgery and the fix?', 'One change edits many files. Move related code together to raise cohesion.']
      ],
      q: [{ q: 'A method takes (string bsb, string acct, decimal amt, string cur, string reference). Which refactoring helps most?', o: ['Add more overloads', 'Make all parameters optional', 'Introduce value objects and a parameter object record', 'Convert to a static method'], a: 2, e: 'Value objects stop mix-ups and invalid values; a record groups the arguments.' }]
    },
    cleancode: {
      say: 'Code is read far more than written, so clean code makes intent obvious: names that say intent, small functions, guard clauses, immutability and nullable reference types, with comments that explain why. Use a Result type for expected business outcomes and exceptions for bugs and infrastructure failures. Automate style so reviews focus on design, correctness and risk.',
      k: ['intention-revealing names', 'guard clauses', 'immutability', 'nullable reference types', 'Result pattern', 'ProblemDetails', 'small PRs', 'code review checklist'],
      p: ['Do not use exceptions for normal control flow.', 'Small PRs (under ~400 lines) get better reviews.', 'Let formatters and analyzers argue about style.', 'Review: correctness, security, performance, readability, tests, observability.'],
      f: [
        ['Exceptions or the Result pattern?', 'Result (ErrorOr, FluentResults) for expected outcomes like insufficient funds. Exceptions for bugs, broken invariants and infrastructure failures, turned into ProblemDetails globally.'],
        ['What should comments explain?', 'Why: a regulation, a workaround or a trade-off. The code itself says what.'],
        ['What would you check in a code review besides style?', 'Edge cases, authorisation and PII in logs, N+1 and sync-over-async, naming, tests, and whether we would know if it broke in production.']
      ],
      q: [{ q: 'A transfer fails because of insufficient funds. How should the service report it?', o: ['Throw an exception and catch it in the controller', 'Return a typed Result error such as a conflict', 'Log it and return null', 'Crash the process'], a: 1, e: 'Insufficient funds is an expected business outcome, so it belongs in a Result type, not an exception.' }]
    },
    bigo: {
      say: 'Big-O describes how work grows with input size. Picking the right collection is usually the cheapest performance win: Dictionary and HashSet give O(1) average lookup, SortedDictionary O(log n), List.Contains O(n). List.Contains inside a loop is O(n squared); switching to a HashSet makes it O(n). Big-O hides constants, so measure.',
      k: ['O(1)', 'O(log n)', 'O(n log n)', 'O(n^2)', 'amortised', 'HashSet', 'PriorityQueue', 'FrozenDictionary'],
      p: ['Dictionary O(1) is average: bad GetHashCode or mutated keys degrade it.', 'Set capacity up front to avoid resizes.', 'FrozenSet/FrozenDictionary for static lookups built once.', 'For tiny n an array scan can win; benchmark.'],
      f: [
        ['Why can a Dictionary lookup be slower than O(1)?', 'O(1) is average. Many keys with the same hash land in one bucket and degrade towards O(n); mutating a key can make it unfindable.'],
        ['Which collection for top-k or scheduling?', 'PriorityQueue<TElement,TPriority>: a min-heap with O(log n) enqueue and dequeue.'],
        ['When would you use a FrozenDictionary?', 'For read-heavy lookups built once at startup, like currency codes; reads are fastest but building is slow and it is read-only.']
      ],
      q: [{ q: 'You check a million payments for duplicate keys with list.Contains in a loop. What is the fix and new complexity?', o: ['Use a HashSet: O(n)', 'Sort the list first: O(n^2)', 'Use a LinkedList: O(1)', 'Use ImmutableArray: O(log n)'], a: 0, e: 'HashSet.Add is O(1) average, so the whole pass becomes O(n) instead of O(n^2).' }]
    },
    patterns: {
      say: 'Most live-coding problems are a variation of about ten patterns: two pointers, sliding window, hash map counting, BFS, DFS, binary search, heap for top-k, dynamic programming, backtracking, intervals and union-find. I spot the cue, name the pattern, say the brute force and its Big-O first, then optimise and test edge cases out loud.',
      k: ['two pointers', 'sliding window', 'hash map counting', 'BFS / DFS', 'binary search', 'heap / top-k', 'dynamic programming', 'backtracking'],
      p: ['Silence is the most common reason people fail.', 'Clarify, examples, brute force, optimise, test edge cases.', 'Top-k: min-heap of size k, O(n log k).', 'PriorityQueue is a min-heap; pass a reversed comparer for max.'],
      f: [
        ['"Longest substring with no repeated characters": which pattern?', 'Sliding window with a dictionary of last positions: O(n).'],
        ['"Shortest path in an unweighted grid": which pattern?', 'BFS with a Queue and a visited set: O(V + E).'],
        ['How do you find the k largest numbers efficiently?', 'Keep a min-heap of size k; when it exceeds k, dequeue the smallest. O(n log k).'],
        ['What is the first thing to say in a live-coding round?', 'Clarify the problem with examples, then state the brute force and its Big-O before optimising.']
      ],
      q: [{ q: 'A problem asks for "the k closest points to the origin". Which pattern fits best?', o: ['Union-find', 'Backtracking', 'Two pointers on unsorted input', 'Heap / top-k'], a: 3, e: '"k closest" or "k largest" is the cue for a heap of size k, giving O(n log k).' }]
    }
  }
};
