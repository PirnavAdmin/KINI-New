export const CODING_QUESTIONS = [
  {
    id: "cq-001",
    title: "Two Sum",
    difficulty: "Easy",
    acceptance: 85,
    points: 100,
    tags: ["Array", "Hash Table"],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return **indices of the two numbers** such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    inputFormat: "First line contains integer n, the size of array. Second line contains n integers. Third line contains target.",
    outputFormat: "Return two space-separated integers representing the indices of the two numbers.",
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "-10⁹ ≤ target ≤ 10⁹",
      "Only one valid answer exists.",
    ],
    examples: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3, 2, 4], target = 6",
        output: "[1, 2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
      },
      {
        input: "nums = [3, 3], target = 6",
        output: "[0, 1]",
        explanation: "Because nums[0] + nums[1] == 6, we return [0, 1].",
      },
    ],
    testCases: [
      { input: "[2,7,11,15]\n9", expected: "[0,1]", runtime: "0.3ms", memory: "2.1 MB" },
      { input: "[3,2,4]\n6", expected: "[1,2]", runtime: "0.2ms", memory: "1.9 MB" },
      { input: "[3,3]\n6", expected: "[0,1]", runtime: "0.1ms", memory: "1.8 MB" },
      { input: "[1,5,8,12]\n13", expected: "[0,3]", runtime: "0.2ms", memory: "2.0 MB" },
    ],
    hints: [
      "A brute force approach would be O(n²). Can you do better?",
      "Think about using a hash map to store elements you've seen.",
      "For each element, check if target - current exists in the hash map.",
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {\n  // Your code here\n};`,
      python: `def two_sum(nums, target):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n    }\n};`,
      typescript: `function twoSum(nums: number[], target: number): number[] {\n    // Your code here\n};`,
      go: `func twoSum(nums []int, target int) []int {\n    // Your code here\n}`,
      rust: `fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {\n    // Your code here\n}`,
    },
  },
  {
    id: "cq-002",
    title: "Valid Parentheses",
    difficulty: "Easy",
    acceptance: 78,
    points: 150,
    tags: ["Stack", "String"],
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    inputFormat: "A single line containing the string s.",
    outputFormat: "Return true if the string is valid, false otherwise.",
    constraints: ["1 ≤ s.length ≤ 10⁴", "s consists of parentheses only '()[]{}'."],
    examples: [
      { input: 's = "()"', output: "true", explanation: "The parentheses are properly matched and closed." },
      { input: 's = "()[]{}"', output: "true", explanation: "All brackets are properly matched." },
      { input: 's = "(]"', output: "false", explanation: "The '(' is closed with ']' which is incorrect." },
    ],
    testCases: [
      { input: "()", expected: "true", runtime: "0.2ms", memory: "1.9 MB" },
      { input: "()[]{}", expected: "true", runtime: "0.3ms", memory: "2.0 MB" },
      { input: "(]", expected: "false", runtime: "0.1ms", memory: "1.8 MB" },
      { input: "([)]", expected: "false", runtime: "0.2ms", memory: "1.9 MB" },
    ],
    hints: [
      "Use a stack data structure to keep track of opening brackets.",
      "When you see a closing bracket, check if it matches the top of the stack.",
      "If the stack is empty when you see a closing bracket, it's invalid.",
    ],
    starterCode: {
      javascript: `function isValid(s) {\n  // Your code here\n};`,
      python: `def is_valid(s):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        // Your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool isValid(string s) {\n        // Your code here\n    }\n};`,
      typescript: `function isValid(s: string): boolean {\n    // Your code here\n};`,
      go: `func isValid(s string) bool {\n    // Your code here\n}`,
      rust: `fn is_valid(s: String) -> bool {\n    // Your code here\n}`,
    },
  },
  {
    id: "cq-003",
    title: "Reverse Linked List",
    difficulty: "Medium",
    acceptance: 72,
    points: 200,
    tags: ["Linked List", "Recursion"],
    description: `Given the \`head\` of a singly linked list, reverse the list, and return the reversed list.

Follow up: A linked list can be reversed either iteratively or recursively. Could you implement both?`,
    inputFormat: "First line contains integer n. Second line contains n integers representing the linked list.",
    outputFormat: "Return the head of the reversed linked list.",
    constraints: ["The number of nodes in the list is in the range [0, 5000].", "-5000 ≤ Node.val ≤ 5000"],
    examples: [
      { input: "head = [1, 2, 3, 4, 5]", output: "[5, 4, 3, 2, 1]", explanation: "The list is reversed from 1→2→3→4→5 to 5→4→3→2→1." },
      { input: "head = [1, 2]", output: "[2, 1]", explanation: "Two nodes swapped." },
      { input: "head = []", output: "[]", explanation: "Empty list returns empty." },
    ],
    testCases: [
      { input: "[1,2,3,4,5]", expected: "[5,4,3,2,1]", runtime: "0.4ms", memory: "2.5 MB" },
      { input: "[1,2]", expected: "[2,1]", runtime: "0.2ms", memory: "2.0 MB" },
      { input: "[]", expected: "[]", runtime: "0.1ms", memory: "1.7 MB" },
    ],
    hints: [
      "Use three pointers: prev, current, and next to reverse the links.",
      "For the recursive approach, reverse the rest of the list first.",
    ],
    starterCode: {
      javascript: `function reverseList(head) {\n  // Your code here\n};`,
      python: `def reverse_list(head):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Your code here\n    }\n};`,
      typescript: `function reverseList(head: ListNode | null): ListNode | null {\n    // Your code here\n};`,
      go: `func reverseList(head *ListNode) *ListNode {\n    // Your code here\n}`,
      rust: `fn reverse_list(head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {\n    // Your code here\n}`,
    },
  },
  {
    id: "cq-004",
    title: "Maximum Subarray",
    difficulty: "Medium",
    acceptance: 68,
    points: 250,
    tags: ["Array", "Divide and Conquer", "DP"],
    description: `Given an integer array \`nums\`, find the **subarray** with the largest sum, and return its sum.`,
    inputFormat: "First line contains integer n. Second line contains n integers.",
    outputFormat: "Return a single integer representing the maximum subarray sum.",
    constraints: ["1 ≤ nums.length ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴"],
    examples: [
      { input: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." },
      { input: "nums = [1]", output: "1", explanation: "Single element is the max." },
      { input: "nums = [5, 4, -1, 7, 8]", output: "23", explanation: "The entire array sums to 23." },
    ],
    testCases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", expected: "6", runtime: "0.5ms", memory: "2.3 MB" },
      { input: "[1]", expected: "1", runtime: "0.1ms", memory: "1.7 MB" },
      { input: "[5,4,-1,7,8]", expected: "23", runtime: "0.2ms", memory: "1.9 MB" },
      { input: "[-1]", expected: "-1", runtime: "0.1ms", memory: "1.6 MB" },
    ],
    hints: [
      "Use Kadane's algorithm: keep track of current sum and max sum.",
      "If current sum becomes negative, reset it to 0.",
    ],
    starterCode: {
      javascript: `function maxSubArray(nums) {\n  // Your code here\n};`,
      python: `def max_sub_array(nums):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        // Your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Your code here\n    }\n};`,
      typescript: `function maxSubArray(nums: number[]): number {\n    // Your code here\n};`,
      go: `func maxSubArray(nums []int) int {\n    // Your code here\n}`,
      rust: `fn max_sub_array(nums: Vec<i32>) -> i32 {\n    // Your code here\n}`,
    },
  },
  {
    id: "cq-005",
    title: "LRU Cache",
    difficulty: "Hard",
    acceptance: 55,
    points: 400,
    tags: ["Hash Table", "Linked List", "Design"],
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\` Initialize the LRU cache with **positive** size capacity.
- \`int get(int key)\` Return the value of the key if the key exists, otherwise return -1.
- \`void put(int key, int value)\` Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity, **evict** the least recently used key.

The functions \`get\` and \`put\` must each run in \`O(1)\` average time complexity.`,
    inputFormat: "Operations are performed sequentially.",
    outputFormat: "Return values for get operations.",
    constraints: ["1 ≤ capacity ≤ 3000", "0 ≤ key ≤ 10⁴", "0 ≤ value ≤ 10⁵", "At most 2 * 10⁵ calls will be made to get and put."],
    examples: [
      {
        input: 'LRUCache(2)\nput(1,1)\nput(2,2)\nget(1)\nput(3,3)\nget(2)\nput(4,4)\nget(1)\nget(3)\nget(4)',
        output: "[null, null, null, 1, null, -1, null, -1, 3, 4]",
        explanation: "LRU cache of capacity 2. After put(3,3), key 2 is evicted. After put(4,4), key 1 is evicted.",
      },
    ],
    testCases: [
      { input: "LRUCache(2)\nput(1,1)\nput(2,2)\nget(1)\nput(3,3)\nget(2)", expected: "[null,null,null,1,null,-1]", runtime: "0.8ms", memory: "3.1 MB" },
      { input: "LRUCache(1)\nput(2,1)\nget(2)\nput(3,2)\nget(2)\nget(3)", expected: "[null,null,1,null,-1,2]", runtime: "0.5ms", memory: "2.6 MB" },
    ],
    hints: [
      "Use a hash map for O(1) key lookup and a doubly linked list for O(1) eviction.",
      "Move accessed nodes to the head of the list to track recency.",
    ],
    starterCode: {
      javascript: `class LRUCache {\n  constructor(capacity) {\n    // Your code here\n  }\n\n  get(key) {\n    // Your code here\n  }\n\n  put(key, value) {\n    // Your code here\n  }\n}`,
      python: `class LRUCache:\n    def __init__(self, capacity):\n        # Your code here\n    \n    def get(self, key):\n        # Your code here\n    \n    def put(self, key, value):\n        # Your code here`,
      java: `class LRUCache {\n    public LRUCache(int capacity) {\n        // Your code here\n    }\n    \n    public int get(int key) {\n        // Your code here\n    }\n    \n    public void put(int key, int value) {\n        // Your code here\n    }\n}`,
      cpp: `class LRUCache {\npublic:\n    LRUCache(int capacity) {\n        // Your code here\n    }\n    \n    int get(int key) {\n        // Your code here\n    }\n    \n    void put(int key, int value) {\n        // Your code here\n    }\n};`,
      typescript: `class LRUCache {\n    constructor(capacity: number) {\n        // Your code here\n    }\n\n    get(key: number): number {\n        // Your code here\n    }\n\n    put(key: number, value: number): void {\n        // Your code here\n    }\n}`,
      go: `type LRUCache struct {\n    // Your code here\n}\n\nfunc Constructor(capacity int) LRUCache {\n    // Your code here\n}\n\nfunc (this *LRUCache) Get(key int) int {\n    // Your code here\n}\n\nfunc (this *LRUCache) Put(key int, value int) {\n    // Your code here\n}`,
      rust: `struct LRUCache {\n    // Your code here\n}\n\nimpl LRUCache {\n    fn new(capacity: i32) -> Self {\n        // Your code here\n    }\n    \n    fn get(&mut self, key: i32) -> i32 {\n        // Your code here\n    }\n    \n    fn put(&mut self, key: i32, value: i32) {\n        // Your code here\n    }\n}`,
    },
  },
];

export const LANGUAGES = [
  { id: "javascript", label: "JavaScript", icon: "JS" },
  { id: "python", label: "Python", icon: "Py" },
  { id: "java", label: "Java", icon: "Jv" },
  { id: "cpp", label: "C++", icon: "C++" },
  { id: "typescript", label: "TypeScript", icon: "TS" },
  { id: "go", label: "Go", icon: "Go" },
  { id: "rust", label: "Rust", icon: "Rs" },
];
