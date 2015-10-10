#!/bin/bash
gulp bump-patch
gulp changelog
gulp release-start
gulp release-finish
gulp package
gulp release-publish

