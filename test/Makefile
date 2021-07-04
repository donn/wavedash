all: test.vcd

test.out: test.v
	iverilog -o test.out test.v

test.vcd: test.out
	./test.out

.PHONY: clean
clean:
	rm $(shell cat .gitignore)