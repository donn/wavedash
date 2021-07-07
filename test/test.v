`timescale 1ns/100ps
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
    for (z = 1; z < 99; z += 1) begin
        if (z % 7 == 0) begin
            b = 1'bx;
        end else begin
            b = $random;
        end
        a += 4.0;
        c = $random;
        if (z % 13 == 0) begin
            c[1] = 1'bz;
        end
        #20;
    end
    $finish;
end
endmodule