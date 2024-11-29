data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1].l1
data modify storage mcs:system registers.r2 set from storage mcs:system stack[-1].a0
execute store success storage mcs:system registers.r1 double 1 if predicate mcs_intrinsic:loe
execute store success storage mcs:system registers.r1 double 1 if predicate mcs_intrinsic:zero
execute if predicate mcs_intrinsic:zero run return run function example:__mcslib_nnnn_fn2_v_b4
function example:__mcslib_nnnn_fn2_v_b9
