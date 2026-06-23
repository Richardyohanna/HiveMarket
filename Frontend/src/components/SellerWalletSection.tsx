// SellerWalletSection.tsx
import { useWallet } from '@/src/hooks/useWallet';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  Pressable, StyleSheet,
  Text,
  View,
} from 'react-native';
import { WithdrawFundsModal } from '../../components/WithdrawFundsModal';
import { useBankVerification, withdrawFromWallet } from '../api/walletApi';

const PRIMARY = '#008100';
const PRIMARY_SOFT = '#e8f5e9';

interface SellerWalletSectionProps {
  userId: string;
  isDark: boolean;
  theme: any;
}

export const SellerWalletSection = ({ userId, isDark, theme }: SellerWalletSectionProps) => {
  const { wallet, loading, error } = useWallet(userId);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {

    if(wallet?.balance == null) return;
    setBalance(Number(wallet?.balance.toFixed(2)));

  },[wallet?.balance])

  const {
    banks, loadingBanks, fetchBanks,
    resolving, resolvedName, resolveError,
    resolveAccount, resetResolve,
  } = useBankVerification();

  const handleSubmit = async (data: {
    amount: number;
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
  }) => {
    setSubmitting(true);
    try {
      await withdrawFromWallet(userId, data.amount, {
        bankName: data.bankName,
        bankCode: data.bankCode,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
      });

      setBalance((prev) => prev - data.amount);
      
      Alert.alert('Success', 'Withdrawal initiated successfully!');
      setShowWithdraw(false);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Withdrawal failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color={PRIMARY} />;
  if (error) return <Text style={{ color: 'red', padding: 14, marginHorizontal: 14 }}>{error}</Text>;
  if (!wallet) return null;

  return (
    <View style={[styles.walletSection, { backgroundColor: theme.sectionBackground, marginHorizontal: 14, marginTop: 16 }]}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>💰 My Wallet</Text>

      <View style={styles.walletCardsRow}>
        <View style={[styles.walletCard, { backgroundColor: isDark ? '#0a1f0a' : PRIMARY_SOFT, borderColor: isDark ? PRIMARY : '#c8e6c9' }]}>
          <Text style={[styles.walletLabel, { color: theme.readColor }]}>Current Balance</Text>
          <Text style={[styles.walletAmount, { color: PRIMARY }]}>₦{balance}</Text>
        </View>
        <View style={[styles.walletCard, { backgroundColor: isDark ? '#0a1f0a' : PRIMARY_SOFT, borderColor: isDark ? PRIMARY : '#c8e6c9' }]}>
          <Text style={[styles.walletLabel, { color: theme.readColor }]}>Total Earned</Text>
          <Text style={[styles.walletAmount, { color: PRIMARY }]}>₦{wallet.totalEarned.toFixed(2)}</Text>
        </View>
      </View>

      <Pressable style={[styles.withdrawBtn, { backgroundColor: PRIMARY }]} onPress={() => setShowWithdraw(true)}>
        <Text style={styles.withdrawBtnText}>💸 Withdraw Funds</Text>
      </Pressable>

      <WithdrawFundsModal
        visible={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        balance={wallet.balance}
        isDark={isDark}
        theme={theme}
        banks={banks}
        loadingBanks={loadingBanks}
        fetchBanks={fetchBanks}
        resolveAccount={resolveAccount}
        resolving={resolving}
        resolvedName={resolvedName}
        resolveError={resolveError}
        resetResolve={resetResolve}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  walletSection: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  walletCardsRow: { flexDirection: 'row', gap: 10 },
  walletCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: 'center', gap: 4 },
  walletLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  walletAmount: { fontSize: 16, fontWeight: '700' },
  withdrawBtn: { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  withdrawBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});