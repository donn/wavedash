all: index.html

test.out: test.v
	iverilog -o test.out test.v

test.vcd: test.out
	./test.out

test.json: test.vcd
	node ./vcd2json.js

index.html: test.json ../lib/svg.js ./render.js
	node ./render.js

.PHONY: clean
clean:
	rm $(shell cat .gitignore)