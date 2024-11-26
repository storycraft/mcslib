data modify storage mcs:system registers.r1 set from storage mcs:system arguments[-1][0]
data modify storage mcs:system registers.r2 set value 3d
function mcs_intrinsic:div with storage mcs:system registers
data modify storage mcs:system locals[-1][9] set from storage mcs:system registers.r1
data modify storage mcs:system registers.r1 set from storage mcs:system locals[-1][9]
data modify storage mcs:system arguments[-1][0] set from storage mcs:system registers.r1
function example:__mcslib_nnn_fn1_n_b1
