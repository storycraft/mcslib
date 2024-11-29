data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1].l1
data modify storage mcs:system registers.r2 set value 0.5d
function mcs_intrinsic:add with storage mcs:system registers
data modify storage mcs:system registers.r2 set from storage mcs:system registers.r1
data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1].l3
function mcs_intrinsic:add with storage mcs:system registers
data modify storage mcs:system stack[-1].l6 set from storage mcs:system registers.r1
data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1].l0
data modify storage mcs:system registers.r2 set value 2d
function mcs_intrinsic:add with storage mcs:system registers
data modify storage mcs:system registers.r2 set from storage mcs:system registers.r1
data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1].l4
function mcs_intrinsic:add with storage mcs:system registers
data modify storage mcs:system stack[-1].l7 set from storage mcs:system registers.r1
data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1].l2
data modify storage mcs:system registers.r2 set value 0.5d
function mcs_intrinsic:add with storage mcs:system registers
data modify storage mcs:system registers.r2 set from storage mcs:system registers.r1
data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1].l5
function mcs_intrinsic:add with storage mcs:system registers
data modify storage mcs:system stack[-1].l8 set from storage mcs:system registers.r1
function example:__mcslib_nnnn_fn2_v_b7 with storage mcs:system stack[-1]
data modify storage mcs:system registers.r1 set from storage mcs:system stack[-1].l2
data modify storage mcs:system registers.r2 set from storage mcs:system stack[-1].a3
function mcs_intrinsic:add with storage mcs:system registers
data modify storage mcs:system stack[-1].l2 set from storage mcs:system registers.r1
function example:__mcslib_nnnn_fn2_v_b5
