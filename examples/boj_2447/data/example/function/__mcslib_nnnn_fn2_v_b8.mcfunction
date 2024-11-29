data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1].l1
data modify storage mcs:system registers.r2 set from storage mcs:system stack[-1].a3
function mcs_intrinsic:add with storage mcs:system registers
data modify storage mcs:system stack[-1].l1 set from storage mcs:system registers.r1
function example:__mcslib_nnnn_fn2_v_b3
