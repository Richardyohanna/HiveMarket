import { Colors, FontSize, generalStyle } from "@/constants/theme";
import ScrollWithRefresh from "@/hooks/ScrollWithRefresh";
import { addCartApi } from "@/src/api/cartAPi";
import { addReactionApi, deleteProductByIdApi, increaseProductViewApi } from "@/src/api/productApi";
import { rate } from "@/src/api/ratingApi";
import { useProductDetail } from "@/src/hooks/useProductDetail";
import { formatTimeAgo } from "@/src/store/productStore";
import { userStore } from "@/src/store/userStore";
import { CommentResponse, RatingRequest, ReactionResponse } from "@/src/types/products";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View
} from "react-native";
import { chatSocketService } from "../../src/api/chatSocket";
import { addComment, getComments, likeComment } from "../../src/api/commentApi";

const { width, height } = Dimensions.get("window");
const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";
const PRIMARY_DARK = "#1a3a1a";
const DANGER       = "#e53935";
const AMBER        = "#EAB308";

// ─── Types ────────────────────────────────────────────────────────────────────
type Comment = {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  rating: number;       // 1-5
  likes: number;
  likedByMe: boolean;
  reported: boolean;
  createdAt: string;
}; 

//this is how the likeByMe will work 
// if the current user is equal to the 
// aurthorId and likeByMe is true set 
// the general output to be true;

// ─── Mock seed comments ───────────────────────────────────────────────────────
const SEED_COMMENTS: Comment[] = [
  {
    id: "c1", author: "Amara J.", avatar: undefined,
    text: "Great seller! Item was exactly as described and delivery was super fast 🔥",
    rating: 5, likes: 12, likedByMe: false, reported: false, createdAt: "2 days ago",
  },
  {
    id: "c2", author: "Tunde B.", avatar: undefined,
    text: "Condition was good but slightly different shade. Still worth it for the price.",
    rating: 4, likes: 7, likedByMe: false, reported: false, createdAt: "4 days ago",
  },
  {
    id: "c3", author: "Chisom E.", avatar: undefined,
    text: "Legit seller. Would buy again 👍",
    rating: 5, likes: 3, likedByMe: false, reported: false, createdAt: "1 week ago",
  },
];

// ─── Star renderer ────────────────────────────────────────────────────────────
const Stars = ({
  rating, size = 14, interactive = false, onRate,
}: {
  rating: number; size?: number; interactive?: boolean; onRate?: (n: number) => void;
}) => (
  <View style={{ flexDirection: "row", gap: 2 }} >
    {[1, 2, 3, 4, 5].map((n) => (
      <Pressable key={n} onPress={() => interactive && onRate?.(n)} disabled={!interactive}>
        <Text style={{ fontSize: size, color: n <= rating ? AMBER : "rgba(200,200,200,0.5)" }}>
          ★
        </Text>
      </Pressable>
    ))}
  </View>
);

// ─── Avatar initials ──────────────────────────────────────────────────────────
const InitialsAvatar = ({ name, size = 36, isDark }: { name: string; size?: number; isDark: boolean }) => {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT,
      alignItems: "center", justifyContent: "center",
    }}>
      <Text style={{ color: PRIMARY, fontWeight: "800", fontSize: size * 0.35 }}>{initials}</Text>
    </View>
  );
};

// ─── Comment card ─────────────────────────────────────────────────────────────
const CommentCard = React.memo(({
  comment, isDark, theme, onLike, onReport,
}: {
  comment: CommentResponse; isDark: boolean; theme: typeof Colors.light;
  onLike: (id: string) => void; onReport: (id: string) => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulse = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.15, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true }),
    ]).start();
  };

  return (
    <View style={[cc.wrap, {
      backgroundColor: isDark ? "#111e11" : "#fff",
      borderColor: isDark ? PRIMARY_DARK : "rgba(0,129,0,0.1)",
    }]}>
      {/* Top row */}
      <View style={cc.top}>
        <InitialsAvatar name={comment.aurthor} isDark={isDark} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[cc.author, { color: theme.text }]}>{comment.aurthor}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Stars rating={comment.rating} size={12} />
            <Text style={[cc.date, { color: theme.readColor }]}>{formatTimeAgo(comment.createdAt)}</Text>
          </View>
        </View>
        {!comment.reported && (
          <Pressable onPress={() => onReport(comment.id)} hitSlop={10}>
            <Text style={[cc.reportBtn, { color: theme.readColor }]}>⚑</Text>
          </Pressable>
        )}
        {comment.reported && (
          <View style={cc.reportedTag}>
            <Text style={cc.reportedText}>Reported</Text>
          </View>
        )}
      </View>

      {/* Body */}
      <Text style={[cc.body, { color: isDark ? "#94A3B8" : "#374151" }]}>{comment.text}</Text>

      {/* Like */}
      <View style={cc.footer}>
        <Pressable
          onPress={() => { pulse(); onLike(comment.id); }}
          style={[cc.likeBtn, {
            backgroundColor: comment.likedByMe
              ? isDark ? "#0a2a0a" : PRIMARY_SOFT
              : isDark ? "#1a2a1a" : "#f1f5f1",
          }]}
        >
          <Animated.Text style={[cc.likeIcon, {
            transform: [{ scale: scaleAnim }],
            color: comment.likedByMe ? PRIMARY : theme.readColor,
          }]}>
            {comment.likedByMe ? "♥" : "♡"}
          </Animated.Text>
          <Text style={[cc.likeCount, {
            color: comment.likedByMe ? PRIMARY : theme.readColor,
          }]}>
            {comment.likes}
          </Text>
        </Pressable>
        <Text style={[cc.helpful, { color: theme.readColor }]}>Helpful?</Text>
      </View>
    </View>
  );
});

const cc = StyleSheet.create({
  wrap: {
    borderRadius: 16, borderWidth: 1, padding: 14, gap: 10,
    shadowColor: PRIMARY, shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  top:         { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  author:      { fontSize: 13, fontWeight: "700" },
  date:        { fontSize: 10 },
  reportBtn:   { fontSize: 16, opacity: 0.5 },
  reportedTag: { backgroundColor: "#fee2e2", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  reportedText:{ color: DANGER, fontSize: 9, fontWeight: "700" },
  body:        { fontSize: 13, lineHeight: 20 },
  footer:      { flexDirection: "row", alignItems: "center", gap: 10 },
  likeBtn:     { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  likeIcon:    { fontSize: 14 },
  likeCount:   { fontSize: 12, fontWeight: "700" },
  helpful:     { fontSize: 11 },
});

// ─── Action icon button ───────────────────────────────────────────────────────
const IconBtn = ({
  emoji, label, active, activeColor = PRIMARY, danger = false, onPress, isDark,
}: {
  emoji: string; label: string; active?: boolean; activeColor?: string;
  danger?: boolean; onPress: () => void; isDark: boolean;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const pop = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.22, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true }),
    ]).start();
  };
  return (
    <Pressable
      onPress={() => { pop(); onPress(); }}
      style={[ib.wrap, {
        backgroundColor: danger
          ? isDark ? "#2a0a0a" : "#fee2e2"
          : active
            ? isDark ? "#0a2a0a" : "#d8ffdb"
            : isDark ? "#1a2a1a" : "#f1f5f1",
      }]}
    >
      <Animated.Text style={[ib.emoji, { transform: [{ scale }], color: isDark ? PRIMARY_SOFT : PRIMARY}]}>{emoji}</Animated.Text>
      <Text style={[ib.label, {
        color: danger ? DANGER : active ? activeColor : isDark ? "#6a8a6a" : "#7a9a7a",
      }]}>
        {label}
      </Text>
    </Pressable>
  );
};

const ib = StyleSheet.create({
  wrap:  { alignItems: "center", gap: 4, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 },
  emoji: { fontSize: 20 },
  label: { fontSize: 10, fontWeight: "700" },
});

// ─── Related mini card ────────────────────────────────────────────────────────
const RelatedCard = React.memo(({
  item, isDark, theme, onPress,
}: {
  item: any; isDark: boolean; theme: typeof Colors.light; onPress: () => void;
}) => (



  <Pressable
    onPress={onPress}
    style={[styles.relatedCard, {
      backgroundColor: theme.sectionBackground,
      borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
    }]}
  >
    <Image
      source={item.imageUrls[0] ? { uri: item.imageUrls[0] } : require("../../assets/images/HomeScreen/nike.png")}
      style={styles.relatedImg}
      resizeMode="cover"
    />
    {item.pQuality && (
      <View style={[styles.relatedBadge, {
        backgroundColor: item.pQuality === "NEW" ? PRIMARY : "#b45309",
      }]}>
        <Text style={styles.relatedBadgeText}>{item.pQuality}</Text>
      </View>
    )}
    <View style={styles.relatedBody}>
      <Text numberOfLines={1} style={[styles.relatedName, { color: theme.text }]}>{item.pName}</Text>
      <View style={styles.relatedMeta}>
        <Text style={[styles.relatedPrice, { color: PRIMARY }]}>₦{Number(item.pAmount).toLocaleString()}</Text>
        <Text style={styles.relatedStar}>★ {Number(item.ratingData?.AverageRating || 0).toFixed(1)}</Text>
      </View>
    </View>
  </Pressable>
));

// ─── Rating breakdown bar ─────────────────────────────────────────────────────
const RatingBar = ({ star, count, total, isDark }: { star: number; count: number; total: number; isDark: boolean }) => (
  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
    <Text style={{ fontSize: 11, color: isDark ? "#6a8a6a" : "#7a9a7a", width: 10 }}>{star}</Text>
    <Text style={{ fontSize: 11, color: AMBER }}>★</Text>
    <View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: isDark ? "#1a2a1a" : "#e4ede4", overflow: "hidden" }}>
      <View style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%", height: "100%", backgroundColor: AMBER, borderRadius: 3 }} />
    </View>
    <Text style={{ fontSize: 10, color: isDark ? "#6a8a6a" : "#9aba9a", width: 16, textAlign: "right" }}>{count}</Text>
  </View>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const ProductDetail = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme  = isDark ? Colors.dark : Colors.light;
  const fs     = FontSize.size;

  const { id } = useLocalSearchParams<{ id: string }>();
  const { email: currentUserEmail , id: currentUserId, full_name } = userStore();

  const {
    product,
    loading,
    refresh,
    loadRecentListings,
    recentListings,
  } = useProductDetail(id as string, currentUserId);

  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [modalVisible,  setModalVisible]  = useState(false);
  const [inCart,        setInCart]        = useState(false);
  const [inFavourites,  setInFavourites]  = useState(false);
  const [comments,      setComments]      = useState<CommentResponse[]>([]);
  const [draftText,     setDraftText]     = useState("");
  const [draftRating,   setDraftRating]   = useState(0);
  const [reviewsOpen,   setReviewsOpen]   = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [reactionCount, setReactionCount] = useState(0);
  const [reacted, setReacted] = useState(false);
  const [serverReaction, setServerReaction] = useState<ReactionResponse | null>(null);
  

  const scrollRef      = useRef<ScrollView>(null);
  const modalScrollRef = useRef<ScrollView>(null);

  console.log("This is the Rating ", draftRating);
  useEffect(() => {
    if (recentListings.length === 0) loadRecentListings(currentUserId || "");
  }, []);


  useEffect(()=> {

    if(product?.id == null) return;

    getComments(product?.id , currentUserId).then((data) => {

      console.log("This is the comment ", data);

    setComments(data);
    }).catch((err) => {
      console.error("Failed to fetch comments:", err);
    });

  }, [product?.id , currentUserId])
  
  useEffect(() => {

    console.log("Product reactions updated. Server reaction:", product?.isReacted,  "THis is the reaction by default " , reacted);
    setReacted(product?.isReacted || false);
    setReactionCount(product?.reactions || 0);
  }, [product?.reactions]);


  useEffect(() => {

    console.log("This is the product.ratingData ", product?.ratingData);

    if(product?.ratingData.userRating != null)
    setDraftRating(product?.ratingData.userRating);

  }, [product?.ratingData.userRating]);


  useEffect(() => {
  
    if(!chatSocketService.isConnected()) return;
  
    if (!product?.id) return;

    const unsubscribe = chatSocketService.updateProduct(product?.id, (data) => {
      console.log("Received product update:", data);
  
      if(data.userId === currentUserId) {
        console.log("Received reaction update for current user, updating local state");
        setServerReaction(data);
        setReactionCount(data.reactions);
        // setReacted(data.isReacted);
      } else {
        setReactionCount(data.reactions);
      }
    }) as (() => void) | undefined;
  
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  
  }, [product?.id]);

  const relatedProducts = useMemo(() => {
  if (!product) return [];

  return recentListings
    .filter((p) => p.id !== product.id)
    .map((p) => ({
      ...p,
      score:
        (p.category === product.category ? 3 : 0) +
        (p.location === product.location ? 2 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}, [recentListings, product]);


  const Rate = useCallback((rating: number)=> {

    if(product?.id == null) return;
    
    if(currentUserId == null || currentUserId == "") {
        Alert.alert("Login Required","Please login to be able to rate this product.", [{text: "Login", onPress: () => router.push("/Login/LoginScreen")}, {text: "Cancel", style: "cancel"}]);
        return;
      }

      const rateRequest: RatingRequest = {
        userId: currentUserId,
        productId: product?.id,
        rating: rating
      }

      rate(rateRequest);

  }, [product?.id, currentUserId, rate, router])


  const handleReaction = () => {
  
    if (!currentUserId) {
  
      Alert.alert("Login Required","Please login to react to products.", [{text: "Login", onPress: () => router.push("/Login/LoginScreen")}, {text: "Cancel", style: "cancel"}]);
    //("User ID is not available for reactions");
      return;
    }
  
  console.log("Is Reacted before toggle:", reacted);
  const nextReacted = !reacted;
  
  console.log("Is Reacted before toggle:", nextReacted);
  
  setReacted(nextReacted);
  
  setReactionCount(prev =>
    nextReacted ? prev + 1 : prev - 1
  );
  
  if (!product?.id) {
      console.log("Product ID is missing, cannot send reaction");
      return;
    }
    const reactionData = {
  
      productId: product?.id,
      userId: currentUserId
  
    }
  
    console.log("Preparing to send reaction data:", reactionData);
    console.log("isReacted state at reaction time:", reacted);
    
     console.log("Reaction data:", reactionData);
  
     addReactionApi(reactionData, (data) => {
      console.log("Reaction updated:", data);
     // setServerReaction(data);
      //
    }).catch((err) => {
      console.error("Failed to update reaction:", err);
      // Optionally revert UI state here if the API call fails
    });
      
      
      
        //setReacted(false);
      
  };


  const isOwner = product?.sellerEmail === currentUserEmail;

  // ── Derived review stats ───────────────────────────────────────────────────
  const avgRating = comments.length
    ? comments.reduce((s, c) => s + c.rating, 0) / comments.length
    : 0;
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: comments.filter((c) => c.rating === star).length,
  }));

  // ── Handlers ──────────────────────────────────────────────────────────────
  const onBack = useCallback(() => router.push("/"), []);

  const onBuy = useCallback(() => {
    router.push({ pathname: "/TransactionScreen/TransactionScreen", params: { id } });
  }, [id]);

  const onProfileClicked = useCallback(() => {
    router.push({ pathname: "/ProfileScreen/IndividualProfileScreen", params: { id: product?.sellerId } });
  }, [product?.sellerId]);

  const onRelatedClicked = useCallback((relatedId: string) => {
    increaseProductViewApi(relatedId);
    router.push({ pathname: "/ProductDetail/ProductDetail", params: { id: relatedId } });
  }, []);

  const onChatClicked = useCallback(() => {
    if (!product?.id || !product.sellerId || !product.sellerName) return;

    if(currentUserId == null || currentUserId == "") {

      Alert.alert("Login Required","Please login to chat with the seller.", [{text: "Login", onPress: () => router.push("/Login/LoginScreen")}, {text: "Cancel", style: "cancel"}]);

      return;
    }
    router.push({
      pathname: "/ChatScreen/[id]",
      params: {
        id: product.id,
        buyerId: currentUserId,
        sellerId: product.sellerId,
        fullName: product.sellerName,
        avatar: product.sellerProfilePicture,
      },
    });
  }, [currentUserId, product]);


  const onShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Check out "${product?.pName}" for ₦${Number(product?.pAmount).toLocaleString()} on HiveMarket! 🛒`,
        title: product?.pName,
      });
    } catch {}
  }, [product]);

  const onDelete = useCallback(() => {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to delete this product? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: call your delete API here
            Alert.alert("Deleted", "Your listing has been removed.");

            console.log("Attempting to delete product with ID:", id);
            
            deleteProductByIdApi(id).catch((err) => {
              console.error("Failed to delete product:", err);
            });
            router.push("/(tabs)/HomeScreen");
          },
        },
      ]
    );
  }, []);

  const onCart = useCallback(() => {
    
    // TODO: wire to cart store/API

    console.log( "THis is the userID ", currentUserId, " and thiis is the seller id", product?.sellerId);
    if(currentUserId == null || currentUserId == "") {       
        
        Alert.alert("Login Required","Please login to add items to your cart.", [{text: "Login", onPress: () => router.push("/Login/LoginScreen")}, {text: "Cancel", style: "cancel"}]);
        return
      };



    if(product?.id == null || product.sellerId == null) return;
  
      addCartApi({user_id: currentUserId, product_id: product?.id, seller_id: product.sellerId});


      setInCart((p) => !p);
    
  }, [product?.sellerId, product?.id, currentUserId ]);

 

  const onFavourite = useCallback(() => {
    setInFavourites((p) => !p);
    // TODO: wire to favourites store/API
  }, []);

  const onLike = useCallback((commentId: string) => {

    if(currentUserId == null || currentUserId == "") {

      Alert.alert("Login Required","Please login to like reviews.", [{text: "Login", onPress: () => router.push("/Login/LoginScreen")}, {text: "Cancel", style: "cancel"}]);
      return;
      
    }

    likeComment(commentId, currentUserId).then((data: any) => {

      console.log("Comment like toggled successfully" , data);
      }).catch((err: any) => {
        console.error("Failed to toggle comment like:", err);
        Alert.alert("Error", "Failed to like the comment. Please try again.");
        return;
      });

    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, likedByMe: !c.likedByMe, likes: c.likedByMe ? c.likes - 1 : c.likes + 1 }
          : c
      )
    );
  }, []);

  const onReport = useCallback((commentId: string) => {
    Alert.alert(
      "Report Review",
      "Are you sure you want to report this review as inappropriate or a scam?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report",
          style: "destructive",
          onPress: () =>
            setComments((prev) =>
              prev.map((c) => (c.id === commentId ? { ...c, reported: true } : c))
            ),
        },
      ]
    );
  }, []);

  

  const onSubmitReview = useCallback(() => {

    if(currentUserId == null || currentUserId == "") {
      Alert.alert("Please Login", "To send a comment you have to login please" , [{text: "Login", onPress: () => router.push("/Login/LoginScreen")}, {text: "Cancel", style: "cancel"}])
      return;
    }
    if (draftRating === 0) {
      Alert.alert("Rating required", "Please tap a star to rate this product.");
      return;
    }
    if (!draftText.trim()) {
      Alert.alert("Review required", "Please write a short review.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {

    const tempId = `temp-${Date.now()}`;

    const optimisticComment: CommentResponse = {
      id: tempId,
      aurthor: full_name,
      avatar: "",
      text: draftText.trim(),
      likes: 0,
      rating: draftRating,
      likedByMe: false,
      reported: false,
      createdAt: "Just now",
    };

      setComments((prev) => [optimisticComment, ...prev]);

      //THis is where i will add comment 
      console.log("This is the text of the comment being submitted:", draftText);
      addComment({
        aurthorId: currentUserId ?? "",
        productId: product?.id ?? "",
        text: draftText.trim(),
      }).then((data) => {

        //setComments(data);
        console.log("Comment added successfully");
      }).catch((err: any) => {
        console.error("Failed to add comment:", err);
        Alert.alert("Error", "Failed to submit your review. Please try again.");
        return;
      });

      //setComments((prev) => [newComment, ...prev]);
      setDraftText("");
      //setDraftRating(0);
      setSubmitting(false);
      Keyboard.dismiss();
      // TODO: POST to your comments API here
    }, 600);
  }, [draftText, draftRating, currentUserEmail]);

  // ── Early returns ─────────────────────────────────────────────────────────
  if (loading && !product) {
    return (
      <View style={[styles.stateScreen, { backgroundColor: theme.screenBackground }]}>
        <Text style={[styles.stateText, { color: theme.readColor }]}>Loading...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.stateScreen, { backgroundColor: theme.screenBackground }]}>
        <Text style={[styles.stateText, { color: theme.readColor }]}>Product not found</Text>
      </View>
    );
  }

  

  const images = product.imageUrls?.length > 0 ? product.imageUrls : ["fallback"];

  return (
    <View style={{ flex: 1, backgroundColor: theme.screenBackground , paddingTop: 25}}>

      {/* ── Header ── */}
      <View style={[styles.header, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.headerBtn}>
         {/*} <Image
            source={require("../../assets/images/ProductDetail/back.png")}
            style={[styles.headerIcon, { tintColor: theme.subText }]}
          /> */}

          <Text style={{ fontSize: 30, color: theme.text, fontWeight: "700" }} > ← </Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontSize: 17, fontWeight: "900", letterSpacing: -0.4 }]}>Product Detail</Text>
        <Pressable onPress={onShare} hitSlop={12} style={styles.headerBtn}>
          <Text style={{ fontSize: 30, color: theme.text }}>➦</Text>
        </Pressable>
      </View>

      <ScrollWithRefresh onRefresh={() => loadRecentListings(currentUserId || "")}>

        {/* ── Image carousel ── */}
        <View style={styles.carouselWrapper}>
          <ScrollView
            ref={scrollRef}
            horizontal pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            scrollEventThrottle={16}
          >
            {images.map((img, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  setModalVisible(true);
                  setCurrentIndex(index);
                  setTimeout(() => {
                    modalScrollRef.current?.scrollTo({ x: index * width, animated: false });
                  }, 100);
                }}
              >
                <Image
                  source={img === "fallback"
                    ? require("../../assets/images/ProductDetail/Hero Image.png")
                    : { uri: img }}
                  style={{ width, height: 340 }}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.counterPill}>
            <Text style={styles.counterText}>{currentIndex + 1} / {images.length}</Text>
          </View>
          <View style={styles.dotsRow}>
            {images.map((_, i) => (
              <View key={i} style={[
                styles.dot,
                i === currentIndex
                  ? { width: 16, backgroundColor: "#fff" }
                  : { width: 6, backgroundColor: "rgba(255,255,255,0.5)" },
              ]} />
            ))}
          </View>

        <Pressable
          onPress={handleReaction}
          style={[
            generalStyle.wishlistBtn,
            {
              backgroundColor: isDark ? "#0f1f0f" : "#fff",
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
              paddingHorizontal: reactionCount > 0 ? 8 : undefined,
              width: reactionCount > 0 ? undefined : 32,
            },
          ]}
        >
          <Text style={{ fontSize: 13 }}>{reacted ? "❤️" : "🤍"}</Text> 
          {reactionCount > 0 && (
            <Text style={{ fontSize: 10, fontWeight: "700", color: reacted ? "#e53935" : theme.readColor }}>
              {reactionCount}
            </Text>
          )}
        </Pressable>
        </View>

        {/* ── Details ── */}
        <View style={styles.details}>

          {/* Price + condition */}
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: PRIMARY }]}>
              ₦{Number(product.pAmount).toLocaleString()}
            </Text>
            {product.pCondition && (
              <View style={[styles.condBadge, {
                backgroundColor: product.pCondition === "NEW" ? PRIMARY_SOFT : "#fff3e0",
              }]}>
                <Text style={[styles.condText, {
                  color: product.pCondition === "NEW" ? PRIMARY : "#b45309",
                }]}>
                  {product.pCondition}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.productName, { color: theme.text }]}>{product.pName}</Text>
          <Text style={{ color: theme.readColor, fontSize: 13 }}>
            {product.pQuantity} of {product.pName} available
          </Text>

          {/* Rating row    avgRating.toFixed(1) Math.round(avgRating) */}   
          <View style={styles.metaRow}>
            <Stars
              rating={Math.round(Number(product?.ratingData?.AverageRating ?? 0))}
              size={14}
            />
            <Text style={[styles.metaText, { color: theme.readColor }]}>
              {Number(product?.ratingData?.AverageRating ?? 0).toFixed(1)} · {comments.length} reviews
            </Text>
            {(product.views ?? 0) > 0 && (
              <Text style={[styles.metaText, { color: theme.readColor }]}>
                 · {product.views} views
              </Text>
            )}
          </View>

          {/* ── Quick action bar ── */}
          <View style={[styles.actionBar, {
            backgroundColor: isDark ? "#111e11" : "#fff",
            borderColor: isDark ? PRIMARY_DARK : "rgba(0,129,0,0.1)",
          }]}>
            <IconBtn
              emoji={inCart ? "🛒" : "🛒"}
              label={inCart ? "In Cart" : "Add Cart"}
              active={inCart}
              onPress={onCart}
              isDark={isDark}

            />
            
           {/*
            <View style={[styles.actionDivider, { backgroundColor: isDark ? "#1e331e" : "#e4f0e4" }]} />
           
              This is the saved button
            <IconBtn
              emoji={inFavourites ? "❤️" : "🤍"}
              label={inFavourites ? "Saved" : "Favourite"}
              active={inFavourites}
              onPress={onFavourite}
              isDark={isDark}
            />  */}


            <View style={[styles.actionDivider, { backgroundColor: isDark ? "#1e331e" : "#e4f0e4" }]} />

            <IconBtn
              emoji="➦"
              label="Share"
              onPress={onShare}
              isDark={isDark}
            />
            {isOwner && (
              <>
                <View style={[styles.actionDivider, { backgroundColor: isDark ? "#1e331e" : "#e4f0e4" }]} />
                <IconBtn
                  emoji="🗑️"
                  label="Delete"
                  danger
                  onPress={onDelete}
                  isDark={isDark}
                />
              </>
            )}
          </View>

          {/* Owner edit banner */}
          {isOwner && (
            <View style={[styles.ownerBanner, { borderColor: isDark ? PRIMARY_DARK : "rgba(0,129,0,0.2)", backgroundColor: isDark ? "#0a1e0a" : "#f0faf0" }]}>
              <Text style={{ fontSize: 16 }}>✏️</Text>
              <Text style={[styles.ownerText, { color: isDark ? "#7aba7a" : "#3a7a3a" }]}>
                This is your listing.
              </Text>
              <Pressable style={[styles.editBtn, { borderColor: PRIMARY }]}>
                <Text style={{ color: PRIMARY, fontSize: 12, fontWeight: "700" }}>Edit</Text>
              </Pressable>
            </View>
          )}

          {/* Description */}
          <Text style={[styles.description, { color: isDark ? "#94A3B8" : "#64748B" }]}>
            {product.pDetail}
          </Text>

          {/* Location */}
          {product.location && (
            <View style={[styles.locationCard, {
              backgroundColor: theme.sectionBackground,
              borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
            }]}>
              <Text style={{ fontSize: 16 , color: theme.text}}>⌯✈︎</Text>
              <Text style={[styles.locationText, { color: theme.text }]}>{product.location}</Text>
            </View>
          )}

          {/* ── Seller card ── */}
          <Text style={[styles.sectionLabel, { color: theme.readColor }]}>SELLER INFORMATION</Text>
          <Pressable
            onPress={onProfileClicked}
            style={[styles.sellerCard, {
              backgroundColor: theme.sectionBackground,
              borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
            }]}
          >
            <Image
              source={product.sellerProfilePicture
                ? { uri: product.sellerProfilePicture }
                : require("../../assets/images/ProductDetail/profilePicture.png")}
              style={styles.sellerAvatar}
            />
            <View style={styles.sellerInfo}>
              <Text style={[styles.sellerName, { color: theme.text }]}>
                {product.sellerName || "Unknown Seller"}
              </Text>
              <Text style={[styles.sellerEmail, { color: theme.readColor }]}>
                {product.sellerEmail || ""}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.star}>★</Text>
                <Text style={[styles.metaText, { color: theme.readColor }]}>4.9 · Top Seller</Text>
              </View>
            </View>
            <View style={[styles.profileArrow, { backgroundColor: isDark ? "#0f1f0f" : PRIMARY_SOFT }]}>
              <Text style={[styles.arrowText, { color: PRIMARY }]}>›</Text>
            </View>
          </Pressable>

          {/* ── Bottom action buttons ── */}
          <View style={styles.bottomRow}>
            <Pressable style={[styles.chatBtn, {
              borderColor: PRIMARY,
              backgroundColor: isDark ? "#0f1f0f" : PRIMARY_SOFT,
            }]}
              onPress={()=> onChatClicked()}
            >
              <Image
                source={require("../../assets/images/ProductDetail/chat.png")}
                style={[styles.actionIcon, { tintColor: PRIMARY }]}
              />
              <Text style={[styles.chatBtnText, { color: PRIMARY }]}>Chat</Text>
            </Pressable>

            <Pressable
              onPress={onBuy}
              style={[styles.buyBtn, { backgroundColor: PRIMARY }]}
            >
              <View style={styles.btnShimmer} />
              <Text style={styles.buyBtnText}>Buy Now</Text>
            </Pressable>
          </View>

          
          {/* ── Related products ── */}
          {relatedProducts.length > 0 && (
            <>
              <View style={styles.relatedHeader}>
                <View style={[styles.relatedAccent, { backgroundColor: PRIMARY }]} />
                <Text style={[styles.relatedTitle, { color: theme.text }]}>You May Also Like</Text>
              </View>
              <FlatList
                data={relatedProducts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => `rel_${item.id}`}
                contentContainerStyle={styles.relatedList}
                renderItem={({ item }) => (
                  <RelatedCard
                    item={item}
                    isDark={isDark}
                    theme={theme}
                    onPress={() => onRelatedClicked(item.id)}
                  />
                )}
              />
            </>
          )}

          {/* ── Reviews section ── */}
          <View style={[styles.reviewsHeader]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={[styles.relatedAccent, { backgroundColor: PRIMARY }]} />
              <Text style={[styles.relatedTitle, { color: theme.text }]}>
                Reviews & Ratings
              </Text>
            </View>
            <Pressable onPress={() => setReviewsOpen(p => !p)}>
              <Text style={{ color: PRIMARY, fontSize: 12, fontWeight: "700" }}>
                {reviewsOpen ? "Hide ▲" : "Show all ▼"}
              </Text>
            </Pressable>
          </View>

          {/* Rating summary avgRating.toFixed(1) Math.round(avgRating) */}
          <View style={[styles.ratingCard, {
            backgroundColor: isDark ? "#111e11" : "#fff",
            borderColor: isDark ? PRIMARY_DARK : "rgba(0,129,0,0.1)",
          }]}>
            <View style={styles.ratingLeft}>
              <Text style={[styles.bigRating, { color: isDark ? "#d0ffd0" : "#0d1a0d" }]}> 
                  {Number(product?.ratingData?.AverageRating ?? 0).toFixed(1)} 
              </Text> 
              <Stars rating={Math.round(Number(product?.ratingData?.AverageRating ?? 0))} size={16} />
              <Text style={[styles.ratingCount, { color: theme.readColor }]}>
                {comments.length} reviews
              </Text>
            </View>
            <View style={styles.ratingRight}>
              {/*{ratingCounts.map(({ star, count }) => (
                <RatingBar key={star} star={star} count={count} total={comments.length} isDark={isDark} />
              ))} */}

              <RatingBar  star={5} count={product.ratingData.totalFiveRating} total={product.ratingData.totalRating} isDark={isDark} />
              <RatingBar  star={4} count={product.ratingData.totalFourRating} total={product.ratingData.totalRating} isDark={isDark} />
              <RatingBar  star={3} count={product.ratingData.totalThreeRating} total={product.ratingData.totalRating} isDark={isDark} />
              <RatingBar  star={2} count={product.ratingData.totalTwoRating} total={product.ratingData.totalRating} isDark={isDark} />
              <RatingBar  star={1} count={product.ratingData.totalOneRating} total={product.ratingData.totalRating} isDark={isDark} />
            </View>
          </View>

          {/* Write a review */}
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={[styles.writeReview, {
              backgroundColor: isDark ? "#111e11" : "#fff",
              borderColor: isDark ? PRIMARY_DARK : "rgba(0,129,0,0.1)",
            }]}>
              <Text style={[styles.writeTitle, { color: theme.text }]}>Leave a Review</Text>
              <View style={styles.starPicker}>
                <Text style={[{ color: theme.readColor, fontSize: 13 }]}>Your rating:</Text>
                <Stars rating={draftRating} size={26} interactive onRate={(data) => {setDraftRating(data); Rate(data)}} />
              </View>
              <View style={[styles.reviewInputWrap, {
                backgroundColor: isDark ? "#152015" : "#f0faf0",
                borderColor: draftText ? PRIMARY : isDark ? DARK_BORDER : "rgba(0,129,0,0.15)",
              }]}>
                <TextInput
                  value={draftText}
                  onChangeText={setDraftText}
                  placeholder="Share your experience with this product or seller..."
                  placeholderTextColor={isDark ? "#3a5a3a" : "#9aba9a"}
                  style={[styles.reviewInput, { color: isDark ? "#e0ffe0" : "#0d1a0d" }]}
                  multiline
                  maxLength={300}
                />
                <Text style={[styles.charCount, { color: theme.readColor }]}>
                  {draftText.length}/300
                </Text>
              </View>
              <Pressable
                onPress={onSubmitReview}
                disabled={submitting}
                style={[styles.submitBtn, {
                  backgroundColor: draftRating > 0 && draftText.trim() ? PRIMARY : isDark ? "#1a2e1a" : "#c8e6c8",
                  opacity: submitting ? 0.7 : 1,
                }]}
              >
                <Text style={[styles.submitText, {
                  color: draftRating > 0 && draftText.trim() ? "#fff" : isDark ? "#3a5a3a" : "#8aaa8a",
                }]}>
                  {submitting ? "Posting…" : "Post Review"}
                </Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>

          {/* Comment list */}
          {(reviewsOpen ? comments : comments.slice(0, 2)).map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              isDark={isDark}
              theme={theme}
              onLike={onLike}
              onReport={onReport}
            />
          ))}

          {!reviewsOpen && comments.length > 2 && (
            <Pressable
              onPress={() => setReviewsOpen(true)}
              style={[styles.seeMoreBtn, {
                backgroundColor: isDark ? "#111e11" : "#fff",
                borderColor: isDark ? PRIMARY_DARK : "rgba(0,129,0,0.1)",
              }]}
            >
              <Text style={{ color: PRIMARY, fontSize: 13, fontWeight: "700" }}>
                See all {comments.length} reviews ▼
              </Text>
            </Pressable>
          )}



        </View>
      </ScrollWithRefresh>

      {/* ── Fullscreen image modal ── */}
      <Modal visible={modalVisible} transparent={false} animationType="fade">
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <Pressable onPress={() => setModalVisible(false)} style={styles.modalClose} hitSlop={16}>
            <Text style={styles.modalCloseText}>✕</Text>
          </Pressable>
          <ScrollView
            ref={modalScrollRef}
            horizontal pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            scrollEventThrottle={16}
          >
            {images.map((img, index) => (
              <Image
                key={index}
                source={img === "fallback"
                  ? require("../../assets/images/ProductDetail/Hero Image.png")
                  : { uri: img }}
                style={{ width, height }}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
          <View style={styles.modalCounter}>
            <Text style={{ color: "#fff", fontSize: 13 }}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
        </View>
      </Modal>

    </View>
  );
};

export default ProductDetail;

// ─── Styles ───────────────────────────────────────────────────────────────────
const DARK_BORDER = "rgba(0,180,0,0.18)";

const styles = StyleSheet.create({
  stateScreen: { flex: 1, alignItems: "center", justifyContent: "center" },
  stateText:   { fontSize: 14, fontWeight: "500" },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1,
  },
  headerBtn:   { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerIcon:  { width: 20, height: 20, resizeMode: "contain" },
  headerTitle: { },

  carouselWrapper: { position: "relative" },
  counterPill: {
    position: "absolute", top: 14, left: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  counterText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  dotsRow: {
    position: "absolute", bottom: 12, alignSelf: "center",
    flexDirection: "row", gap: 5, alignItems: "center",
  },
  dot: { height: 6, borderRadius: 3 },
  floatingHeart: {
    position: "absolute", top: 14, left: 14,
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },

  details: { padding: 16, gap: 12 },

  priceRow:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  price:       { fontSize: 26, fontWeight: "900" },
  condBadge:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  condText:    { fontSize: 11, fontWeight: "800" },
  productName: { fontSize: 18, fontWeight: "700", lineHeight: 24 },
  metaRow:     { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText:    { fontSize: 12, fontWeight: "500" },
  star:        { color: AMBER, fontSize: 13 },

  // Quick action bar
  actionBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-around",
    borderRadius: 18, borderWidth: 1, paddingVertical: 6,
    shadowColor: PRIMARY, shadowOpacity: 0.06,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  actionDivider: { width: 1, height: 36 },

  // Owner banner
  ownerBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, borderWidth: 1, padding: 12,
  },
  ownerText: { flex: 1, fontSize: 13, fontWeight: "600" },
  editBtn:   { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5 },

  description: { fontSize: 14, lineHeight: 21 },

  locationCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 12, borderRadius: 12, borderWidth: 1,
  },
  locationText: { fontSize: 13, fontWeight: "500", flex: 1 },

  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginTop: 4 },

  sellerCard: {
    flexDirection: "row", alignItems: "center",
    padding: 12, borderRadius: 16, borderWidth: 1, gap: 12,
  },
  sellerAvatar:  { width: 52, height: 52, borderRadius: 26 },
  sellerInfo:    { flex: 1, gap: 3 },
  sellerName:    { fontSize: 14, fontWeight: "700" },
  sellerEmail:   { fontSize: 11 },
  profileArrow:  { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  arrowText:     { fontSize: 22, fontWeight: "700", marginTop: -2 },

  relatedHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  relatedAccent: { width: 4, height: 18, borderRadius: 2 },
  relatedTitle:  { fontSize: 15, fontWeight: "700" },
  relatedList:   { gap: 10, paddingBottom: 4 },
  relatedCard: {
    width: 148, borderRadius: 14, borderWidth: 1, overflow: "hidden",
    shadowColor: PRIMARY, shadowOpacity: 0.06, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  relatedImg:       { width: "100%", height: 120 },
  relatedBadge:     { position: "absolute", top: 6, left: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 },
  relatedBadgeText: { color: "#fff", fontSize: 8, fontWeight: "800" },
  relatedBody:      { padding: 8, gap: 4 },
  relatedName:      { fontSize: 11, fontWeight: "600" },
  relatedMeta:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  relatedPrice:     { fontSize: 12, fontWeight: "800" },
  relatedStar:      { fontSize: 10, color: AMBER, fontWeight: "700" },

  // Reviews
  reviewsHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4,
  },
  ratingCard: {
    flexDirection: "row", borderRadius: 16, borderWidth: 1,
    padding: 14, gap: 16, alignItems: "center",
    shadowColor: PRIMARY, shadowOpacity: 0.05, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  ratingLeft:  { alignItems: "center", gap: 6, minWidth: 70 },
  bigRating:   { fontSize: 36, fontWeight: "900", letterSpacing: -1 },
  ratingCount: { fontSize: 10 },
  ratingRight: { flex: 1, gap: 5 },

  writeReview: {
    borderRadius: 16, borderWidth: 1, padding: 16, gap: 12,
    shadowColor: PRIMARY, shadowOpacity: 0.05, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  writeTitle:  { fontSize: 14, fontWeight: "800" },
  starPicker:  { flexDirection: "row", alignItems: "center", gap: 12 },
  reviewInputWrap: {
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6, gap: 4,
  },
  reviewInput: { fontSize: 14, lineHeight: 20, minHeight: 72 },
  charCount:   { fontSize: 10, textAlign: "right" },
  submitBtn:   {
    borderRadius: 14, paddingVertical: 14, alignItems: "center",
    overflow: "hidden", position: "relative",
  },
  submitText:  { fontWeight: "800", fontSize: 14 },

  seeMoreBtn: {
    borderRadius: 14, borderWidth: 1, paddingVertical: 12,
    alignItems: "center",
  },

  // Bottom CTA
  bottomRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  chatBtn: {
    width: 110, height: 52, borderWidth: 2, borderRadius: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  actionIcon:  { width: 18, height: 18, resizeMode: "contain" },
  chatBtnText: { fontSize: 14, fontWeight: "700" },
  buyBtn: {
    flex: 1, height: 52, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden", position: "relative",
  },
  btnShimmer: {
    position: "absolute", top: 0, left: "10%",
    width: "30%", height: "100%",
    backgroundColor: "rgba(255,255,255,0.1)",
    transform: [{ skewX: "-20deg" }],
  },
  buyBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },

  modalClose:     { position: "absolute", top: 44, right: 20, zIndex: 10, padding: 8 },
  modalCloseText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  modalCounter:   { position: "absolute", bottom: 32, alignSelf: "center" },
});