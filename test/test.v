module test;

reg real a;
reg b;
reg[4:0] c;
integer z;

initial begin
    $dumpfile("test.vcd");
    $dumpvars(0, test);
    a = 0.0;
    b = 0;
    c = 0;
    #20;
    for (z = 0; z < 99; z += 1) begin
        a += 4.0;
        b = $random;
        c = $random;
        #20;
    end
    $finish;
end
endmodule