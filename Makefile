CXX = g++
CPPFLAGS = -g -Wall -std=c++11

calculateScore: score_calculator.cpp score_calculator.hpp
	$(CXX) $(CPPFLAGS) $< -o $@

permutation: permutation.cpp
	$(CXX) $(CPPFLAGS) $< -o $@