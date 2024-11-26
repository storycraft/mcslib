data modify storage mcs:system registers.r1 set from storage mcs:system locals[-1][3]
data modify storage mcs:system registers.r2 set from storage mcs:system arguments[-1][0]
execute store success storage mcs:system registers.r1 double 1 unless predicate mcs_intrinsic:goe
data modify storage mcs:system locals[-1][4] set from storage mcs:system registers.r1
data modify storage mcs:system registers.r1 set from storage mcs:system locals[-1][4]
execute store success storage mcs:system registers.r1 double 1 if predicate mcs_intrinsic:zero
data modify storage mcs:system locals[-1][5] set from storage mcs:system registers.r1
data modify storage mcs:system registers.r1 set from storage mcs:system locals[-1][5]
execute if predicate mcs_intrinsic:zero run return run function example:__mcslib_n_fn0_v_b4
function example:__mcslib_n_fn0_v_b7
