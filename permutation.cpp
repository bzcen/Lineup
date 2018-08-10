#include <iostream>
#include <fstream>
#include <vector>

// This program prints the possible permutations in a set of size S that sum to N
// 

/* EXPECTED FORMAT OF INPUT
N
S
<S numbers separated by spaces>
*/

void showPermutationsHelper(std::vector<int> group, int& count, int n, int sum,
 std::vector<int> v, int v_index) {
    if (sum == n) {
        count++;
        for (int i = 0; i < group.size(); i++) {
            std::cout << group[i] << " ";
        }
        std::cout << std::endl;
    } else if (sum < n && v_index < v.size()) {
        // do not take the current v_index number
        showPermutationsHelper(group, count, n, sum, v, ++v_index);
        // take it
        int num = v[v_index];
        group.push_back(num);
        sum += num;
        showPermutationsHelper(group, count, n, sum, v, ++v_index);
    }
    // we just drop this path if sum > n or v_index >= v.size()
}

// recursive
void showPermutations(int n, std::vector<int> v) {
    int count = 0;
    showPermutationsHelper(std::vector<int>(), count, n, 0, v, 0);
    std::printf("There are %d total permutations\n", count);
}

int main() {
    // grab the input file
    std::ifstream input("permutation.txt");

    int n, s;
    // grab the target number N
    input >> n;
    // grab the set size S
    input >> s;

    std::printf("Permutations in set of size %d that sum to %d...\n", s, n);

    std::vector<int> v;
    int temp;
    for (int i = 0; i < s; i++) {
        input >> temp;
        v.push_back(temp);
    }
    showPermutations(n, v);
}