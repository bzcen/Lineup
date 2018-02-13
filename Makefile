CXX = g++
CPPFLAGS = -g -Wall -std=c++11

all: calculateScore
	./calculateScore

calculateScore: score_calculator.cpp score_calculator.hpp
	$(CXX) $(CPPFLAGS) $< -o $@