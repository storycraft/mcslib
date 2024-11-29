data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1].l0
data modify storage mcs:system registers.r2 set from storage mcs:system stack[-1].a0
execute store success storage mcs:system registers.r1 double 1 unless predicate mcs_intrinsic:goe
execute store success storage mcs:system registers.r1 double 1 if predicate mcs_intrinsic:zero
execute if predicate mcs_intrinsic:zero run return run function example:__mcslib_n_fn0_v_b2
function example:__mcslib_n_fn0_v_b8
