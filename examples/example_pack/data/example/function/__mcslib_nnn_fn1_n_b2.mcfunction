data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1].a0
data modify storage mcs:system registers.r2 set value 3d
function mcs_intrinsic:div with storage mcs:system registers
data modify storage mcs:system stack[-1].a0 set from storage mcs:system registers.r1
function example:mcslib_nnn_fn1_n
