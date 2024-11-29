data modify storage mcs:system registers.r1 set value 0d
data modify storage mcs:system stack[-1].l1 set from storage mcs:system registers.r1
function example:__mcslib_nnnn_fn2_v_b3
