data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1].a0
data modify storage mcs:system registers.r2 set value 1d
execute store success storage mcs:system registers.r1 double 1 if predicate mcs_intrinsic:goe
execute store success storage mcs:system registers.r1 double 1 if predicate mcs_intrinsic:zero
execute if predicate mcs_intrinsic:zero run return run function example:__mcslib_nnn_fn1_n_b1
function example:__mcslib_nnn_fn1_n_b3
