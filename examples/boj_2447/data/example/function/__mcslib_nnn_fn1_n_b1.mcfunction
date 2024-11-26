data modify storage mcs:system registers.r1 set from storage mcs:system arguments[-1][0]
data modify storage mcs:system registers.r2 set value 1d
execute store success storage mcs:system registers.r1 double 1 if predicate mcs_intrinsic:goe
data modify storage mcs:system locals[-1][0] set from storage mcs:system registers.r1
data modify storage mcs:system registers.r1 set from storage mcs:system locals[-1][0]
execute store success storage mcs:system registers.r1 double 1 if predicate mcs_intrinsic:zero
data modify storage mcs:system locals[-1][1] set from storage mcs:system registers.r1
data modify storage mcs:system registers.r1 set from storage mcs:system locals[-1][1]
execute if predicate mcs_intrinsic:zero run return run function example:__mcslib_nnn_fn1_n_b2
function example:__mcslib_nnn_fn1_n_b4
