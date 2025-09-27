package database

import (
	"context"
	"time"
)

func withContextTimeout() (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), 10*time.Second)
}

func timeFromUnix(i int64) time.Time {
	return time.Unix(i, 0)
}
