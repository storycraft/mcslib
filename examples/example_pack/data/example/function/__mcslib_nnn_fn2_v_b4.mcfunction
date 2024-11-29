data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1].l1
data modify storage mcs:system registers.r2 set from storage mcs:system stack[-1].l2
function mcs_intrinsic:add with storage mcs:system registers
data modify storage mcs:system stack[-1].l4 set from storage mcs:system registers.r1
data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1].l3
data modify storage mcs:system registers.r2 set from storage mcs:system stack[-1].l0
function mcs_intrinsic:add with storage mcs:system registers
data modify storage mcs:system stack[-1].l5 set from storage mcs:system registers.r1
function example:__mcslib_nnn_fn2_v_b5 with storage mcs:system stack[-1]
data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1].l2
data modify storage mcs:system registers.r2 set from storage mcs:system stack[-1].a2
function mcs_intrinsic:add with storage mcs:system registers
data modify storage mcs:system stack[-1].l2 set from storage mcs:system registers.r1
function example:__mcslib_nnn_fn2_v_b3
