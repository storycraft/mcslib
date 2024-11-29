data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1].l2
data modify storage mcs:system registers.r2 set from storage mcs:system stack[-1].a1
execute store success storage mcs:system registers.r1 double 1 unless predicate mcs_intrinsic:goe
execute store success storage mcs:system registers.r1 double 1 if predicate mcs_intrinsic:zero
execute if predicate mcs_intrinsic:zero run return run function example:__mcslib_nnnn_fn2_v_b6
function example:__mcslib_nnnn_fn2_v_b8
