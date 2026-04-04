import React, { ReactNode, useState } from "react";
import {
    RefreshControl,
    ScrollView,
    ScrollViewProps,
} from "react-native";

type RefreshProp = ScrollViewProps & {
  onRefresh?: () => Promise<void> | void;
  children?: ReactNode;
};

const ScrollWithRefresh = ({
  onRefresh,
  children,
  ...scrollViewProps
}: RefreshProp) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      if (onRefresh) {
        await onRefresh();
      } else {
        console.log("refreshing");
      }
    } catch (error) {
      console.log("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      {...scrollViewProps}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {children}
    </ScrollView>
  );
};

export default ScrollWithRefresh;