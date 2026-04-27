#!/usr/bin/env bash
# يضبط LD_LIBRARY_PATH لـ Playwright Chromium على بيئة Replit (NixOS)
# لأن chromium-headless-shell يطلب libgbm.so.1 و libudev.so.1 من نِكس.

set +e

# ابحث عن libgbm
GBM_LIB=""
for d in /nix/store/*-mesa-libgbm-*/lib; do
  if [ -f "$d/libgbm.so.1" ]; then
    GBM_LIB="$d"
    break
  fi
done

# ابحث عن libudev من systemd-minimal-libs
UDEV_LIB=""
for d in /nix/store/*-systemd-minimal-libs-*/lib; do
  if [ -f "$d/libudev.so.1" ]; then
    UDEV_LIB="$d"
    break
  fi
done

if [ -n "$GBM_LIB" ]; then
  export LD_LIBRARY_PATH="$GBM_LIB:${LD_LIBRARY_PATH}"
fi
if [ -n "$UDEV_LIB" ]; then
  export LD_LIBRARY_PATH="$UDEV_LIB:${LD_LIBRARY_PATH}"
fi

# حذف الفاصلة الأخيرة الفارغة إن وُجدت
export LD_LIBRARY_PATH="${LD_LIBRARY_PATH%:}"
